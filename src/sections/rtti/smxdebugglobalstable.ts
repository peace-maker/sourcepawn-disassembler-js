import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { DebugVarEntry } from '../../types/rtti/debugvarentry';
import { SmxNameTable } from '../smxnametable';
import { SmxDebugSymbolsTable } from './smxdebugsymbolstable';

export class SmxDebugGlobalsTable extends SmxDebugSymbolsTable {
  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
    super(file, section, names);
  }

  public findGlobal(address: number): DebugVarEntry | null {
    this.EnsureSortedAddress();

    for (let i = 0; i < this.addressSortedEntries.length; i++) {
      const sym = this.addressSortedEntries[i];
      // There's a symbol right at that address.
      if (sym.address === address) {
        return sym;
      }

      // We're already past that address now :(
      if (address < sym.address) {
        break;
      }

      // Reached the last entry - there's nothing next.
      if (i === this.addressSortedEntries.length - 1) {
        break;
      }

      // See if the searched address is part of an array.
      const nextSym = this.addressSortedEntries[i + 1];
      if (address > sym.address && address < nextSym.address) {
        return sym;
      }
    }

    return null;
  }
}
