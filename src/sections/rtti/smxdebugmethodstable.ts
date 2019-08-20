import { FileHeader } from '../../fileheader';
import { SectionEntry } from '../../sectionentry';
import { DebugVarEntry, SymScope } from '../../types';
import { DebugMethodEntry } from '../../types/rtti/debugmethodentry';
import { SmxDebugLocalsTable } from './smxdebuglocalstable';
import { SmxRttiListTable } from './smxrttilisttable';

export class SmxDebugMethodTable extends SmxRttiListTable {
  public entries: DebugMethodEntry[];
  private locals: SmxDebugLocalsTable;

  public constructor(file: FileHeader, section: SectionEntry, locals: SmxDebugLocalsTable) {
    super(file, section);

    this.locals = locals;

    const view = new DataView(file.sectionReader(section), this.headersize);
    this.entries = [];
    for (let i = 0; i < this.rowcount; i++) {
      const entry = new DebugMethodEntry();
      entry.methodIndex = view.getInt32(i * this.rowsize + 0, true);
      entry.firstLocal = view.getInt32(i * this.rowsize + 4, true);
      this.entries[i] = entry;
    }
  }

  public getMethodLocals(index: number): DebugVarEntry[] {
    if (index < 0 || index >= this.entries.length) {
      return [];
    }

    if (!this.locals) {
      return [];
    }

    const method = this.entries[index];
    let stopAt = this.locals.entries.length;
    if (index !== this.entries.length - 1) {
      stopAt = this.entries[index + 1].firstLocal;
    }

    const vars = this.locals.entries.slice(method.firstLocal, stopAt);
    // Show arguments first and sort locals by the order of declaration.
    vars.sort((a: DebugVarEntry, b: DebugVarEntry): number => {
      if (a.scope === b.scope) {
        return a.address - b.address;
      }
      if (a.scope === SymScope.Arg) {
        return -1;
      }
      if (b.scope === SymScope.Arg) {
        return 1;
      }
      return a.scope - b.scope;
    });

    return vars;
  }
}
