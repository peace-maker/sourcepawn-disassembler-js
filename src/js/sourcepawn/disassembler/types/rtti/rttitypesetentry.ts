export default class RttiTypesetEntry {
    public static readonly Size: number = 8;

    // Offset into the .names section.
    public nameoffs!: number;

    // Encoded type id.
    public signature!: number;

    // Computed name.
    public name!: string;
}
