import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { PStructGlobalEntry } from '../types';
import { SmxNameTable } from './smxnametable';
import { SmxSection } from './smxsection';

export class SmxPStructGlobalTable extends SmxSection {
  public entries: PStructGlobalEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    if (section.size % PStructGlobalEntry.Size !== 0) {
      throw new Error('invalid pstruct global table size');
    }

    const view = new DataView(file.sectionReader(section));
    const count = section.size / PStructGlobalEntry.Size;
    this.entries = [];
    for (let i = 0; i < count; i++) {
      const entry = new PStructGlobalEntry();
      entry.nameoffs = view.getUint32(i * PStructGlobalEntry.Size, true);
      entry.first_value = view.getUint32(i * PStructGlobalEntry.Size + 4, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.entries[i] = entry;
    }
  }
}
