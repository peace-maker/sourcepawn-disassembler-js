export default class RttiClassDefEntry {
    public static readonly Size: number = 28;

    public flags!: number;

    // Offset into the .names section.
    public nameoffs!: number;

    // Index into rtti.fields section table.
    public firstField!: number;

    // Unused yet.
    public reserved0!: number;
    public reserved1!: number;
    public reserved2!: number;
    public reserved3!: number;

    // Computed name.
    public name!: string;
}
