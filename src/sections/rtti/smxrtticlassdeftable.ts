import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { RttiClassDefEntry } from '../../types/rtti/rtticlassdefentry';
import { SmxNameTable } from '../smxnametable';
import { SmxRttiListTable } from './smxrttilisttable';

export class SmxRttiClassDefTable extends SmxRttiListTable {
  public classdefs: RttiClassDefEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    const view = new DataView(file.sectionReader(section), this.headersize);
    this.classdefs = [];
    for (let i = 0; i < this.rowcount; i++) {
      const entry = new RttiClassDefEntry();
      entry.flags = view.getUint32(i * this.rowsize + 0, true);
      entry.nameoffs = view.getUint32(i * this.rowsize + 4, true);
      entry.firstField = view.getUint32(i * this.rowsize + 8, true);
      entry.reserved0 = view.getUint32(i * this.rowsize + 12, true);
      entry.reserved1 = view.getUint32(i * this.rowsize + 16, true);
      entry.reserved2 = view.getUint32(i * this.rowsize + 20, true);
      entry.reserved3 = view.getUint32(i * this.rowsize + 24, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.classdefs[i] = entry;
    }
  }
}
