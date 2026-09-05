import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { RttiGlobalsEntry } from '../../types';
import { SmxNameTable } from '../smxnametable';
import { SmxRttiListTable } from './smxrttilisttable';

export class SmxRttiGlobalsTable extends SmxRttiListTable {
  public globals: RttiGlobalsEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    const view = new DataView(file.sectionReader(section), this.headersize);
    this.globals = [];
    for (let i = 0; i < this.rowcount; i++) {
      const entry = new RttiGlobalsEntry();
      entry.nameoffs = view.getUint32(i * this.rowsize + 0, true);
      entry.typeid = view.getUint32(i * this.rowsize + 4, true);
      entry.flags = view.getUint32(i * this.rowsize + 8, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.globals[i] = entry;
    }
  }
}
