import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { RttiTypedefEntry } from '../../types/rtti/rttitypedefentry';
import { SmxNameTable } from '../smxnametable';
import { SmxRttiListTable } from './smxrttilisttable';

export class SmxRttiTypedefTable extends SmxRttiListTable {
  public typedefs: RttiTypedefEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    const view = new DataView(file.sectionReader(section), this.headersize);
    this.typedefs = [];
    for (let i = 0; i < this.rowcount; i++) {
      const entry = new RttiTypedefEntry();
      entry.nameoffs = view.getUint32(i * this.rowsize + 0, true);
      entry.typeid = view.getUint32(i * this.rowsize + 4, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.typedefs[i] = entry;
    }
  }
}
