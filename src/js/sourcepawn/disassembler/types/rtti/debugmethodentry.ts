export default class DebugMethodEntry {
    public static readonly Size: number = 8;

    // Index of associated method in .rtti.methods table.
    public methodIndex!: number;

    // Offset into .rtti.data where first local variable is defined.
    public firstLocal!: number;
}
