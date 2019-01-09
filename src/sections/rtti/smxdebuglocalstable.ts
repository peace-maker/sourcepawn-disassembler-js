import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { SourcePawnFile } from '../../sourcepawnfile';
import { DebugVarEntry } from '../../types/rtti/debugvarentry';
import { SmxNameTable } from '../smxnametable';
import { SmxDebugSymbolsTable } from './smxdebugsymbolstable';

export class SmxDebugLocalsTable extends SmxDebugSymbolsTable {
  private smxFile: SourcePawnFile;

  public constructor(smxFile: SourcePawnFile, file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section, names);
    this.smxFile = smxFile;
  }

  public findLocal(codeaddr: number, address: number): DebugVarEntry | null {
    let startAt = 0;
    let stopAt = this.entries.length;

    if (this.smxFile.debugMethods != null && this.smxFile.rttiMethods != null) {
      let index = null;

      for (let i = 0; i < this.smxFile.debugMethods.entries.length; i++) {
        const methodIndex = this.smxFile.debugMethods.entries[i].methodIndex;
        const method = this.smxFile.rttiMethods.methods[methodIndex];
        if (codeaddr >= method.pcodeStart && codeaddr < method.pcodeEnd) {
          index = i;
          break;
        }
      }

      if (index != null) {
        startAt = this.smxFile.debugMethods.entries[index].firstLocal;
        if (index !== this.smxFile.debugMethods.entries.length - 1) {
          stopAt = this.smxFile.debugMethods.entries[index + 1].firstLocal;
        }
      }
    }

    for (let i = startAt; i < stopAt; i++) {
      const sym = this.entries[i];
      // That symbol isn't visible in the scope.
      if (codeaddr < sym.codestart || codeaddr >= sym.codeend) {
        continue;
      }

      // There's a symbol right at that address.
      if (sym.address === address) {
        return sym;
      }

      // Reached the last entry - there's nothing next.
      if (i === stopAt - 1) {
        break;
      }

      // See if the searched address is part of an array.
      const nextSym = this.entries[i + 1];
      if (address > sym.address && address < nextSym.address) {
        return sym;
      }
    }

    return null;
  }
}
