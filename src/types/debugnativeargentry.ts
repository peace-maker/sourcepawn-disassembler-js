import { DebugSymbolDimEntry } from './debugsymboldimentry';
import { SymKind } from './symkind';

export class DebugNativeArgEntry {
  // IDENT value.
  public ident!: SymKind;

  // Tag id (unmasked).
  public tagid!: number;

  // Number of dimensions (and DebugSymbolDimEntries).
  public dimcount!: number;

  // Offset into .dbg.names.
  public nameoffs!: number;

  // Computed name.
  public name!: string;

  // Array dimensions.
  public dims!: DebugSymbolDimEntry[];
}
