import { SymScope } from "../symscope";

export default class DebugVarEntry {
    public static readonly Size: number = 21;

    // Address relative to DAT or STK.
    public address!: number;

    // Visibility of the symbol.
    public scope!: SymScope;

    // Offset into the .names section.
    public nameoffs!: number;

    // Live in region >= codestart.
    public codestart!: number;

    // Live in region < codeend.
    public codeend!: number;

    // Offset into .rtti.typedefs table.
    public typeid!: number;

    // Computed name.
    public name!: string;
}
