export default class DebugLineEntry {
    public static readonly Size: number = 8;

    // Offset into the code section.
    public address!: number;

    // Line number.
    public line!: number;
}
