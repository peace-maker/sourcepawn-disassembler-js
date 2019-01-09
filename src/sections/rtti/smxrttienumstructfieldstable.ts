import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { RttiEnumStructFieldEntry } from '../../types/rtti/rttienumstructfieldentry';
import { SmxNameTable } from '../smxnametable';
import { SmxRttiListTable } from './smxrttilisttable';

export class SmxRttiEnumStructFieldTable extends SmxRttiListTable {
  public entries: RttiEnumStructFieldEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    const view = new DataView(file.sectionReader(section), this.headersize);
    this.entries = [];
    for (let i = 0; i < this.rowcount; i++) {
      const entry = new RttiEnumStructFieldEntry();
      entry.nameoffs = view.getUint32(i * this.rowsize + 0, true);
      entry.typeId = view.getUint32(i * this.rowsize + 4, true);
      entry.offset = view.getUint32(i * this.rowsize + 8, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.entries[i] = entry;
    }
  }
}
