export default class RttiNativeEntry {
    public static readonly Size: number = 12;

    // Offset into the .names section.
    public nameoffs!: number;

    // Encoded type id.
    public signature!: number;

    // Computed name.
    public name!: string;
}
