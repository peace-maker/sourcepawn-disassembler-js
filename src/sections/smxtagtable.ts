import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { TagEntry } from '../types/tagentry';
import { SmxNameTable } from './smxnametable';
import { SmxSection } from './smxsection';

export class SmxTagTable extends SmxSection {
  public tags: TagEntry[];
  private cache: { [index: number]: TagEntry };

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section);

    if (section.size % TagEntry.Size !== 0) {
      throw new Error('invalid tag table size');
    }

    this.cache = {};

    const view = new DataView(file.sectionReader(section));
    const count = section.size / TagEntry.Size;
    this.tags = [];
    for (let i = 0; i < count; i++) {
      const entry = new TagEntry();
      entry.tag = view.getUint32(i * TagEntry.Size, true);
      entry.nameoffs = view.getUint32(i * TagEntry.Size + 4, true);
      entry.name = names.stringAt(entry.nameoffs);
      this.tags[i] = entry;
    }
  }

  public findTag(tagid: number): TagEntry | null {
    if (tagid in this.cache) {
      return this.cache[tagid];
    }

    for (const tag of this.tags) {
      if (tag.id === tagid) {
        this.cache[tagid] = tag;
        return tag;
      }
    }
    return null;
  }
}
