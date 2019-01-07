export default class RttiEnumEntry {
    public static readonly Size: number = 16;

    // Offset into the .names section.
    public nameoffs!: number;

    // Not used yet.
    public reserved0!: number;
    public reserved1!: number;
    public reserved2!: number;

    // Computed name.
    public name!: string;
}
