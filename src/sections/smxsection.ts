import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';

export class SmxSection {
  protected file: FileHeader;
  protected header: SectionEntry;

  public constructor(file: FileHeader, section: SectionEntry) {
    this.file = file;
    this.header = section;
  }
}
