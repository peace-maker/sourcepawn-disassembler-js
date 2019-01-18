import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { SourcePawnFile } from '../../sourcepawnfile';
import { TypeBuilder } from '../../types/rtti/typebuilder';
import { TypeId } from '../../types/rtti/typeid';
import { SmxSection } from '../smxsection';

export class SmxRttiDataSection extends SmxSection {
  public bytes: Uint8Array;
  private smxFile: SourcePawnFile;

  public constructor(smxFile: SourcePawnFile, file: FileHeader, section: SectionEntry) {
    super(file, section);

    this.smxFile = smxFile;
    this.bytes = new Uint8Array(file.sectionReader(section));
  }

  public typeFromTypeId(typeId: number): string {
    const kind = typeId & 0xf;
    const payload = (typeId >> 4) & 0xfffffff;

    if (kind === TypeId.Inline) {
      const temp = new Uint8Array(4);
      temp[0] = payload & 0xff;
      temp[1] = (payload >> 8) & 0xff;
      temp[2] = (payload >> 16) & 0xff;
      temp[3] = (payload >> 24) & 0xff;

      const tb = new TypeBuilder(this.smxFile, temp, 0);
      return tb.decodeNew();
    }
    if (kind !== TypeId.Complex) {
      throw new Error('Unknown type id kind: ' + kind);
    }
    return this.buildTypename(payload);
  }

  public functionTypeFromOffset(offset: number): string {
    const tb = new TypeBuilder(this.smxFile, this.bytes, offset);
    return tb.decodeFunction();
  }

  public typesetTypesFromOffset(offset: number): string[] {
    // FIXME: Use TypeBuilder.decodeUint32()
    const view = new DataView(this.bytes, offset);
    const count = view.getUint32(0, true);
    const types = [];

    const tb = new TypeBuilder(this.smxFile, this.bytes, offset + 4);
    for (let i = 0; i < count; i++) {
      types[i] = tb.decodeNew();
    }
    return types;
  }

  private buildTypename(offset: number): string {
    const b = new TypeBuilder(this.smxFile, this.bytes, offset);
    const text = b.decodeNew();
    offset = b.offset;
    return text;
  }
}
