import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { SmxSection } from './smxsection';

export class SmxNameTable extends SmxSection {
  private names: { [index: number]: string };
  private offsetsList: number[];

  public constructor(file: FileHeader, section: SectionEntry) {
    super(file, section);
    this.names = {};
    this.offsetsList = [];
  }

  // Returns a string at a given index.
  public stringAt(index: number): string {
    if (this.names[index] != null) {
      return this.names[index];
    }

    if (index >= this.header.size) {
      throw new Error('invalid string index');
    }

    let length = 0;
    const array = new Uint8Array(this.file.sectionReader(this.header));
    for (let i = index; i < this.header.size; i++) {
      if (array[i] === 0) {
        break;
      }
      length++;
    }

    const value = new TextDecoder('utf-8').decode(array.slice(index, index + length));
    this.names[index] = value;
    return value;
  }

  // Returns a list of all root indexes that map to strings.
  get offsets(): number[] {
    if (this.offsetsList.length === 0) {
      this.computeStringOffsets();
    }
    return this.offsetsList;
  }

  private computeStringOffsets(): void {
    let lastIndex = 0;
    const array = new Uint8Array(this.file.sectionReader(this.header));
    for (let i = 0; i < this.header.size; i++) {
      if (array[i] === 0) {
        this.offsetsList.push(lastIndex);
        lastIndex = i + 1;
      }
    }
  }
}
