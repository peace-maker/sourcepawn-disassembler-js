import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { SmxSection } from './smxsection';

// The .dbg.info section.
export class SmxDebugInfoSection extends SmxSection {
  public numFiles: number;
  public numLines: number;
  public numSymbols: number;
  public numArrays: number;

  public constructor(file: FileHeader, section: SectionEntry) {
    super(file, section);

    // console.log(new Uint8Array(file.sectionReader(section)).toString());
    const view = new DataView(file.sectionReader(section));
    // console.log(view);
    this.numFiles = view.getInt32(0, true);
    this.numLines = view.getInt32(4, true);
    this.numSymbols = view.getInt32(8, true);
    this.numArrays = view.getInt32(12, true);
  }
}
