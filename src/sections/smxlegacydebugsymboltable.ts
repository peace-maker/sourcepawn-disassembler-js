import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { DebugSymbolDimEntry } from '../types/debugsymboldimentry';
import { DebugSymbolEntry } from '../types/debugsymbolentry';
import { SymKind } from '../types/symkind';
import { SymScope } from '../types/symscope';
import { SmxDebugInfoSection } from './smxdebuginfosection';
import { SmxNameTable } from './smxnametable';
import { SmxSection } from './smxsection';
import { SmxTagTable } from './smxtagtable';

export class SmxLegacyDebugSymbolTable extends SmxSection {
  public entries: DebugSymbolEntry[];
  private datRefs: DebugSymbolEntry[];
  private functionSymbols: DebugSymbolEntry[];
  private globalVariables: DebugSymbolEntry[];
  private tags: SmxTagTable;

  public constructor(file: FileHeader, section: SectionEntry, info: SmxDebugInfoSection, names: SmxNameTable, tags: SmxTagTable) {
    super(file, section);

    this.tags = tags;

    const view = new DataView(file.sectionReader(section));
    this.entries = [];
    this.datRefs = [];
    this.functionSymbols = [];
    this.globalVariables = [];
    let offset = 0;
    for (let i = 0; i < info.numSymbols; i++) {
      const entry = new DebugSymbolEntry();
      entry.address = view.getInt32(offset, true);
      entry.tagid = view.getUint16(offset + 4, true);
      if (file.debugUnpacked) {
        offset += 2;
      }
      entry.codestart = view.getUint32(offset + 6, true);
      entry.codeend = view.getUint32(offset + 10, true);
      entry.ident = view.getUint8(offset + 14);
      entry.scope = view.getUint8(offset + 15);
      entry.dimcount = view.getUint16(offset + 16, true);
      entry.nameoffs = view.getUint32(offset + 18, true);
      offset += 22;
      entry.name = names.stringAt(entry.nameoffs);
      entry.dims = [];
      for (let d = 0; d < entry.dimcount; d++) {
        const dim = new DebugSymbolDimEntry();
        if (file.debugUnpacked) {
          // There's a padding of 2 bytes before this short.
          offset += 2;
        }
        dim.tagid = view.getUint16(offset, true);
        dim.size = view.getInt32(offset + 2, true);
        entry.dims.push(dim);
        offset += 6;
      }
      this.entries[i] = entry;
    }
  }

  public get functions(): DebugSymbolEntry[] {
    if (this.functionSymbols.length > 0) {
      return this.functionSymbols;
    }

    for (const entry of this.entries) {
      if (entry.ident !== SymKind.Function) {
        continue;
      }

      this.functionSymbols.push(entry);
    }
    return this.functionSymbols;
  }

  public findFunction(address: number): DebugSymbolEntry | null {
    for (const fun of this.functions) {
      if (address >= fun.codestart && address <= fun.codeend) {
        return fun;
      }
    }
    return null;
  }

  get globals(): DebugSymbolEntry[] {
    if (this.globalVariables.length > 0) {
      return this.globalVariables;
    }

    this.buildDatRefs();
    for (const entry of this.datRefs) {
      if (entry.scope !== SymScope.Global) {
        continue;
      }

      this.globalVariables.push(entry);
    }
    return this.globalVariables;
  }

  public findStackRef(codeaddr: number, stackaddr: number): DebugSymbolEntry | null {
    // Find symbols belonging to this address range.
    const symbols: DebugSymbolEntry[] = [];
    for (const sym of this.entries) {
      if (sym.scope !== SymScope.Local) {
        continue;
      }
      if (sym.ident === SymKind.Function || sym.ident === SymKind.VarArgs) {
        continue;
      }
      if (codeaddr >= sym.codestart && codeaddr <= sym.codeend) {
        symbols.push(sym);
      }
    }

    // We sort locals in reverse order, since the stack grows down.
    symbols.sort((a, b) => a.address - b.address);

    for (let i = 0; i < symbols.length; i++) {
      const sym = symbols[i];
      if (sym.address === stackaddr) {
        return sym;
      }

      // Ignore parameters if the offset isn't identical.
      if (sym.address > 0) {
        continue;
      }

      // No next symbol... just bail.
      if (i === symbols.length - 1) {
        break;
      }

      // Only arrays can be accessed out of their starting address.
      if (sym.ident !== SymKind.Array) {
        continue;
      }

      // Accessing elements of an array?
      const nextSym = symbols[i + 1];
      if (stackaddr > sym.address && stackaddr < nextSym.address) {
        return sym;
      }
    }
    return null;
  }

  public findDataRef(address: number): DebugSymbolEntry | null {
    this.buildDatRefs();
    for (let i = 0; i < this.datRefs.length; i++) {
      const sym = this.datRefs[i];
      if (sym.address === address) {
        return sym;
      }
      if (address < sym.address) {
        break;
      }

      // No next symbol... just bail.
      if (i === this.datRefs.length - 1) {
        break;
      }

      // Only arrays can be accessed out of their starting address.
      if (sym.ident !== SymKind.Array) {
        continue;
      }

      const nextSym = this.datRefs[i + 1];
      if (address > sym.address && address < nextSym.address) {
        return sym;
      }
    }
    return null;
  }

  public renderVariable(sym: DebugSymbolEntry): string {
    let output = '';

    if (sym.scope === SymScope.Static) {
      output += 'static ';
    }

    if (sym.ident === SymKind.Reference) {
      output += '&';
    }

    if (this.tags) {
      const tag = this.tags.findTag(sym.tagid);
      if (tag && tag.name !== '_') {
        output += tag.name + ':';
      }
    }

    output += sym.name;
    
    for (let d = 0; d < sym.dimcount; d++) {
      const dim = sym.dims[d];
      output += '[';
      if (this.tags) {
        const dimTag = this.tags.findTag(dim.tagid);
        if (dimTag && dimTag.name !== '_') {
          output += dimTag.name + ':';
        }
      }
      if (dim.size > 0) {
        output += dim.size;
      }
      output += ']';
    }

    return output;
  }

  public renderFunction(sym: DebugSymbolEntry): string {
    let signature = '';

    if (sym.scope === SymScope.Static) {
      signature += 'static ';
    }

    if (this.tags) {
      const returnTag = this.tags.findTag(sym.tagid);
      if (returnTag && returnTag.name !== '_') {
        signature += returnTag.name + ':';
      }
    }

    signature += sym.name;

    const args = [];
    for (const arg of this.findArguments(sym)) {
      args.push(this.renderVariable(arg));
    }

    signature += '(' + args.join(', ') + ')';

    return signature;
  }

  public findArguments(func: DebugSymbolEntry): DebugSymbolEntry[] {
    return this.findReferencedVariables(func)[0];
  }

  public findLocals(func: DebugSymbolEntry): DebugSymbolEntry[] {
    return this.findReferencedVariables(func)[1];
  }

  public findReferencedVariables(func: DebugSymbolEntry): DebugSymbolEntry[][] {
    // Find symbols belonging to this address range.
    const args: DebugSymbolEntry[] = [];
    const locals: DebugSymbolEntry[] = [];
    for (const sym of this.entries) {
      if (sym.scope === SymScope.Global) {
        continue;
      }
      if (sym.ident === SymKind.Function) {
        continue;
      }
      if (sym.codestart < func.codestart || sym.codeend > func.codeend) {
        continue;
      }
      // Only looking for arguments
      if (sym.address < 0) {
        locals.push(sym);
      } else {
        args.push(sym);
      }
    }

    // We sort locals in reverse order, since the stack grows down.
    args.sort((a, b) => a.address - b.address);
    locals.sort((a, b) => a.codestart - b.codestart);

    return [args, locals];
  }

  private buildDatRefs(): void {
    if (this.datRefs.length > 0) {
      return;
    }

    for (const sym of this.entries) {
      if (sym.scope === SymScope.Local) {
        continue;
      }
      if (sym.ident === SymKind.Function) {
        continue;
      }
      this.datRefs.push(sym);
    }

    this.datRefs.sort((a, b) => a.address - b.address);
  }
}
