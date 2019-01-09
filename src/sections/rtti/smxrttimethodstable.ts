import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { RttiMethodEntry } from '../../types/rtti/rttimethodentry';
import { SmxNameTable } from '../smxnametable';
import { SmxRttiListTable } from './smxrttilisttable';

export class SmxRttiMethodTable extends SmxRttiListTable {
  public methods: RttiMethodEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    const view = new DataView(file.sectionReader(section), this.headersize);
    this.methods = [];
    for (let i = 0; i < this.rowcount; i++) {
      const entry = new RttiMethodEntry();
      entry.nameoffs = view.getUint32(i * this.rowsize + 0, true);
      entry.pcodeStart = view.getUint32(i * this.rowsize + 4, true);
      entry.pcodeEnd = view.getUint32(i * this.rowsize + 8, true);
      entry.signature = view.getUint32(i * this.rowsize + 12, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.methods[i] = entry;
    }
  }
}
