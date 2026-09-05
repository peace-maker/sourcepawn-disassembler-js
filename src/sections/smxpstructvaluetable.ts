import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { PStructValueEntry } from '../types';
import { SmxNameTable } from './smxnametable';
import { SmxSection } from './smxsection';

export class SmxPStructValueTable extends SmxSection {
  public entries: PStructValueEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    if (section.size % PStructValueEntry.Size !== 0) {
      throw new Error('invalid pstruct value table size');
    }

    const view = new DataView(file.sectionReader(section));
    const count = section.size / PStructValueEntry.Size;
    this.entries = [];
    for (let i = 0; i < count; i++) {
      const entry = new PStructValueEntry();
      entry.field_nameoffs = view.getUint32(i * PStructValueEntry.Size, true);
      entry.type_id = view.getUint32(i * PStructValueEntry.Size + 4, true);
      entry.fill_data = view.getUint32(i * PStructValueEntry.Size + 8, true);
      entry.field_name = names.stringAt(entry.field_nameoffs);
      this.entries[i] = entry;
    }
  }
}
