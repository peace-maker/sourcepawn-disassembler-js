export default class NativeEntry {
    public static readonly Size: number = 4;

    // Offset into the .names section.
    public nameoffs!: number;

    // Computed name.
    public name!: string;
}
