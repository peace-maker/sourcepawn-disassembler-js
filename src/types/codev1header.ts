export enum CodeV1Flags {
  Debug = 0x00000001,
}

export enum CodeV1Features {
  Deprecated0 = 1 << 0,
  // This feature adds the INIT_ARRAY opcode, and requires that multi-dimensional
  // arrays use direct internal addressing.
  DirectArrays = 1 << 1,
  // This feature adds the HEAP_SAVE and HEAP_RESTORE opcodes.
  HeapScopes = 1 << 2,
}

export class CodeV1Header {
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

  // Feature set.
  public features!: CodeV1Features;
}
