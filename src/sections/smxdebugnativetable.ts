import { FileHeader } from '../fileheader';
import { SectionEntry } from '../sectionentry';
import { SymKind } from '../types';
import { DebugNativeArgEntry } from '../types/debugnativeargentry';
import { DebugNativeEntry } from '../types/debugnativeentry';
import { DebugSymbolDimEntry } from '../types/debugsymboldimentry';
import { SmxNameTable } from './smxnametable';
import { SmxSection } from './smxsection';
import { SmxTagTable } from './smxtagtable';

export class SmxDebugNativeTable extends SmxSection {
  public entries: DebugNativeEntry[];
  public tags: SmxTagTable;

  public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable, tags: SmxTagTable) {
    super(file, section);

    this.tags = tags;

    const view = new DataView(file.sectionReader(section));
    const numEntries = view.getUint32(0, true);
    this.entries = [];
    let offset = 4;
    for (let i = 0; i < numEntries; i++) {
      const entry = new DebugNativeEntry();
      entry.index = view.getUint32(offset, true);
      entry.nameoffs = view.getUint32(offset + 4, true);
      entry.tagid = view.getUint16(offset + 8, true);
      entry.nargs = view.getUint16(offset + 10, true);
      offset += 12;
      entry.name = names.stringAt(entry.nameoffs);
      entry.args = [];
      for (let a = 0; a < entry.nargs; a++) {
        const arg = new DebugNativeArgEntry();
        arg.ident = view.getUint8(offset);
        arg.tagid = view.getUint16(offset + 1, true);
        arg.dimcount = view.getUint16(offset + 3, true);
        arg.nameoffs = view.getUint32(offset + 5, true);
        offset += 9;
        arg.dims = [];
        for (let d = 0; d < arg.dimcount; d++) {
          const dim = new DebugSymbolDimEntry();
          if (file.debugUnpacked) {
            // There's a padding of 2 bytes before this short.
            offset += 2;
          }
          dim.tagid = view.getUint16(offset, true);
          dim.size = view.getInt32(offset + 2, true);
          arg.dims.push(dim);
          offset += 6;
        }
        arg.name = names.stringAt(arg.nameoffs);
        entry.args.push(arg);
      }
      this.entries[i] = entry;
    }
  }

  public renderSignature(index: number): string {
    if (index < 0 || index >= this.entries.length) {
      throw new Error(`Invalid native index ${index}`);
    }

    const entry = this.entries[index];

    let signature = '';
    if (this.tags) {
      const returnTag = this.tags.findTag(entry.tagid);
      if (returnTag != null && returnTag.name !== '_') {
        signature += returnTag.name + ':';
      }
    }

    signature += entry.name + '(';

    for (let i = 0; i < entry.nargs; i++) {
      if (i > 0) {
        signature += ', ';
      }

      const arg = entry.args[i];
      if (arg.ident === SymKind.Reference) {
        signature += '&';
      }

      if (this.tags) {
        const argTag = this.tags.findTag(arg.tagid);
        if (argTag != null && argTag.name !== '_') {
          signature += argTag.name + ':';
        }
      }

      if (arg.ident === SymKind.VarArgs) {
        signature += '...';
      } else {
        signature += arg.name;
      }
      
      for (let d = 0; d < arg.dimcount; d++) {
        const dim = arg.dims[d];
        signature += '[';
        if (this.tags) {
          const dimTag = this.tags.findTag(dim.tagid);
          if (dimTag && dimTag.name !== '_') {
            signature += dimTag.name + ':';
          }
        }
        if (dim.size > 0) {
          signature += dim.size;
        }
        signature += ']';
      }
    }
    signature += ')';

    return signature;
  }
}
