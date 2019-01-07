enum CodeV1Flags {
    Debug = 0x00000001,
}

export default class CodeV1Header {
    public static readonly Size: number = 16;

    public static readonly VERSION_JIT1: number = 9;
    public static readonly VERSION_JIT2: number = 10;
    public static readonly VERSION_FEATURES: number = 13;

    // Size of the code blob.
    public codesize!: number;

    // Size of a cell in bytes (always 4).
    public cellsize!: number;

    // Code version (see above constants).
    public codeversion!: number;

    // Flags (see above).
    public flags!: CodeV1Flags;

    // Offset within the code blob to the entry point function.
    public main!: number;

    // Offset to the code section.
    public codeoffs!: number;

    public features!: number;
}
