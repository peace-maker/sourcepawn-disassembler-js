import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { SourcePawnFile } from '../../sourcepawnfile';
import { RttiType } from '../../types';
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

  public typeFromTypeId(typeId: number): RttiType {
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
    const b = new TypeBuilder(this.smxFile, this.bytes, payload);
    return b.decodeNew();
  }

  public functionTypeFromOffset(offset: number): RttiType {
    const tb = new TypeBuilder(this.smxFile, this.bytes, offset);
    return tb.decodeFunction();
  }

  public typesetTypesFromOffset(offset: number): RttiType {
    const tb = new TypeBuilder(this.smxFile, this.bytes, offset);
    return tb.decodeTypeset();
  }
}
