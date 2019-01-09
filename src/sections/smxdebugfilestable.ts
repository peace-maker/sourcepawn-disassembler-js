import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { DebugFileEntry } from '../types/debugfileentry';
import { SmxNameTable } from './smxnametable';
import { SmxSection } from './smxsection';

export class SmxDebugFileTable extends SmxSection {
  public entries: DebugFileEntry[];

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    if (section.size % DebugFileEntry.Size !== 0) {
      throw new Error('invalid debug file table size');
    }

    const view = new DataView(file.sectionReader(section));
    const count = section.size / DebugFileEntry.Size;
    this.entries = [];
    for (let i = 0; i < count; i++) {
      const entry = new DebugFileEntry();
      entry.address = view.getUint32(i * DebugFileEntry.Size, true);
      entry.nameoffs = view.getUint32(i * DebugFileEntry.Size + 4, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.entries[i] = entry;
    }
  }

  public findFile(addr: number): string {
    let high = this.entries.length;
    let low = -1;

    while (high - low > 1) {
      const mid = (low + high) / 2;
      if (this.entries[mid].address <= addr) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return this.entries[low].name;
  }
}
