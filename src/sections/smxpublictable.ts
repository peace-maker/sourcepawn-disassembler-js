import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { PublicEntry } from '../types/publicentry';
import { SmxNameTable } from './smxnametable';
import { SmxSection } from './smxsection';

export class SmxPublicTable extends SmxSection {
  public entries: PublicEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    if (section.size % PublicEntry.Size !== 0) {
      throw new Error('invalid public table size');
    }

    const view = new DataView(file.sectionReader(section));
    const count = section.size / PublicEntry.Size;
    this.entries = [];
    for (let i = 0; i < count; i++) {
      const entry = new PublicEntry();
      entry.address = view.getUint32(i * PublicEntry.Size, true);
      entry.nameoffs = view.getUint32(i * PublicEntry.Size + 4, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.entries[i] = entry;
    }
  }
}
