import DebugNativeArgEntry from "./debugnativeargentry";

export default class DebugNativeEntry {
    // Native index.
    public index!: number;

    // Offset into the .dbg.names section.
    public nameoffs!: number;

    // Tag id (unmasked).
    public tagid!: number;

    // Number of formal arguments.
    public nargs!: number;

    // Computed name.
    public name!: string;

    // Formal arguments.
    public args!: DebugNativeArgEntry[];
}
