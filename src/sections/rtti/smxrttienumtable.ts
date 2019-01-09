import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { RttiEnumEntry } from '../../types/rtti/rttienumentry';
import { SmxNameTable } from '../smxnametable';
import { SmxRttiListTable } from './smxrttilisttable';

export class SmxRttiEnumTable extends SmxRttiListTable {
  public enums: RttiEnumEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    const view = new DataView(file.sectionReader(section), this.headersize);
    this.enums = [];
    for (let i = 0; i < this.rowcount; i++) {
      const entry = new RttiEnumEntry();
      entry.nameoffs = view.getUint32(i * this.rowsize + 0, true);
      entry.reserved0 = view.getUint32(i * this.rowsize + 4, true);
      entry.reserved1 = view.getUint32(i * this.rowsize + 8, true);
      entry.reserved2 = view.getUint32(i * this.rowsize + 12, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.enums[i] = entry;
    }
  }
}
