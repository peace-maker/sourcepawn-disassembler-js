import { inflateRaw } from 'pako';
import { SectionEntry } from './sectionentry';

// Compression types. Must be 0 for SP_VERSION_2.
export enum CompressionType {
  None = 0,
  Gz = 1,
}

export class FileHeader {
  // SourcePawn File Format magic number.
  public readonly FILE_MAGIC: number = 0x53504646;

  // File format version number.
  // 0x0101 - SourcePawn 1.0; initial version used by SourceMod 1.0.
  // 0x0102 - SourcePawn 1.1; used by SourceMod 1.1+.
  // 0x0200 - SourcePawn 2.0.
  //
  // The major version bits (8-15) indicate a product number. Consumers
  // should reject any version for a different product.
  //
  // The minor version bits (0-7) indicate a compatibility revision. Any
  // version higher than the current version should be rejected.
  public readonly SP_VERSION_1_0: number = 0x0101;
  public readonly SP_VERSION_1_1: number = 0x0102;
  public readonly SP_VERSION_1_7: number = 0x0107;
  public readonly SP_VERSION_1_13: number = 0x0113;
  public readonly SP_VERSION_2: number = 0x0200;
  public readonly SP_VERSION_MIN: number = this.SP_VERSION_1_0;
  public readonly SP_VERSION_MAX: number = this.SP_VERSION_2;

  // Size of the header.
  public readonly Size: number = 24;

  // Magic number and version number.
  public magic: number;
  public version: number;

  // Compression algorithm. If the file is not compressed, then imagesize and
  // disksize are the same value, and dataoffs is 0.
  //
  // The start of the compressed region is indicated by dataoffs. The length
  // of the compressed region is (disksize - dataoffs). The amount of memory
  // required to hold the decompressed bytes is (imagesize - dataoffs). The
  // compressed region should be expanded in-place. That is, bytes before
  // "dataoffs" should be retained, and the decompressed region should be
  // appended.
  //
  // |imagesize| is the amount of memory required to hold the entire container
  // in memory.
  //
  // Note: This scheme may seem odd. It's a combination of historical debt and
  // previously unspecified behavior. The original .amx file format contained
  // an on-disk structure that supported an endian-agnostic variable-length
  // encoding of its data section, and this structure was loaded directly into
  // memory and used as the VM context. AMX Mod X later developed a container
  // format called ".amxx" as a "universal binary" for 32-bit and 64-bit
  // plugins. This format dropped compact encoding, but supported gzip. The
  // disksize/imagesize oddness made its way to this file format. When .smx
  // was created for SourceMod, it persisted even though AMX was dropped
  // entirely. So it goes.
  public compression: CompressionType;
  public disksize: number;
  public imagesize: number;

  // Number of named file sections.
  public numSections: number;

  // Offset to the string table. Each string is null-terminated. The string
  // table is only used for strings related to parsing the container itself.
  // For SourcePawn, a separate ".names" section exists for Pawn-specific data.
  public stringtab: number;

  // Offset to where compression begins (explained above).
  public dataoffs: number;

  // The computed data buffer (which contains the header).
  public data: ArrayBuffer;
  public sections: SectionEntry[];

  // Version 0x0101 has the debug structures padded.
  public debugUnpacked: boolean;

  public constructor(data: ArrayBuffer) {
    const view = new DataView(data);
    if (data.byteLength < this.Size) {
      throw new Error('bad header size');
    }
    this.magic = view.getUint32(0, true);
    if (this.magic !== this.FILE_MAGIC) {
      throw new Error('invalid file magic value');
    }
    this.version = view.getUint16(4, true);
    this.compression = view.getUint8(6);
    this.disksize = view.getInt32(7, true);
    this.imagesize = view.getInt32(11, true);
    this.numSections = view.getUint8(15);
    this.stringtab = view.getInt32(16, true);
    this.dataoffs = view.getInt32(20, true);
    this.sections = [];

    switch (this.compression) {
      case CompressionType.None:
        this.data = data;
        break;

      case CompressionType.Gz:
        if (this.version >= this.SP_VERSION_2) {
          throw new Error('v2 code does not support compression');
        }

        if (this.disksize > data.byteLength) {
          throw new Error('invalid disksize');
        }
        // The inflated size must be at least as large as the compressed size.
        if (this.imagesize < this.disksize) {
          throw new Error('invalid imagesize');
        }
        // The start of the compression cannot be larger than the file.
        if (this.dataoffs > data.byteLength) {
          throw new Error('illegal compressed region');
        }
        // The compressed region must start after the header.
        if (this.dataoffs < this.Size) {
          throw new Error('illegal compressed region');
        }

        const content = new Uint8Array(data);
        this.data = new ArrayBuffer(this.imagesize);
        const array = new Uint8Array(this.data);

        // Read the delta stuff in between dataoffs and here.
        array.set(content.slice(0, this.dataoffs), 0);

        // Read the compressed buffer.
        const compressed = content.slice(this.dataoffs + 2, this.disksize);
        const result = inflateRaw(compressed);
        array.set(result, this.dataoffs);
        break;
      default:
        throw new Error('unknown compression type');
    }

    if (this.stringtab >= this.data.byteLength) {
      throw new Error('invalid string table value');
    }
    this.readSections();

    this.debugUnpacked = false;
  }

  public sectionReader(section: SectionEntry): ArrayBuffer {
    return this.data.slice(section.dataoffs, section.dataoffs + section.size);
  }

  private readSections(): void {
    let foundDbgNativeSection: boolean = false;
    const view = new DataView(this.data, this.Size);
    // Read section information.
    for (let i = 0; i < this.numSections; i++) {
      const entry = new SectionEntry();
      entry.nameoffs = view.getInt32(i * 12, true);
      if (entry.nameoffs < 0) {
        throw new Error('section name offset overflow');
      }
      entry.dataoffs = view.getInt32(i * 12 + 4, true);
      if (entry.dataoffs < this.Size) {
        throw new Error('section data offset overflow');
      }
      entry.size = view.getInt32(i * 12 + 8, true);
      if (entry.size < 0) {
        throw new Error('section size overflow');
      }
      entry.name = this.stringAt(entry.nameoffs);

      // Remember that there's a .dbg.natives section in the file.
      if (entry.name === '.dbg.natives') {
        foundDbgNativeSection = true;
      }

      this.sections.push(entry);
    }

    // There was a brief period of incompatibility, where version == 0x0101
    // and the packing changed, at the same time .dbg.natives was introduced.
    // Once the incompatibility was noted, version was bumped to 0x0102.
    this.debugUnpacked = this.version === this.SP_VERSION_1_0 && !foundDbgNativeSection;
  }

  private stringAt(index: number): string {
    const view = new Uint8Array(this.data, this.stringtab);
    let count = 0;
    for (let i = index; i < view.length; i++) {
      if (view[i] === 0) {
        break;
      }
      count++;
    }
    return new TextDecoder('utf-8').decode(view.slice(index, index + count));
  }
}
