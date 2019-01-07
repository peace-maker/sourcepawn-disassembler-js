import DebugSymbolDimEntry from "./debugsymboldimentry";
import { SymKind } from "./symkind";
import { SymScope } from "./symscope";

export default class DebugNativeEntry {
    // Address relative to DAT or STK.
    public address!: number;

    // Tag id (unmasked).
    public tagid!: number;

    // Live in region >= codestart.
    public codestart!: number;

    // Live in region < codeend.
    public codeend!: number;

    // An IDENT value.
    public ident!: SymKind;

    // A VCLASS value.
    public scope!: SymScope;

    // Number of dimensions (see DebugSymbolDimEntry).
    public dimcount!: number;

    // Offset into the .dbg.names section.
    public nameoffs!: number;

    // Computed name.
    public name!: string;

    // Array dimensions.
    public dims!: DebugSymbolDimEntry[];
}
