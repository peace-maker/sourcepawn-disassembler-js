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
  // This feature indicates that INVALID_FUNCTION is null (0) instead of -1.
  NullFunctions = 1 << 3,
  // This feature indicates support for int64 and float ops.
  TypedOps = 1 << 4,
}

export class CodeV1Header {
  public static readonly Size: number = 16;

  // Version 9: Initial version.
  // Version 10: DEBUG code flag removed; no bytecode changes.
  // Version 11: Not used; no changes.
  // Version 12: PROC/RETN semantic changes.
  // Version 13: Feature flags in code headers.
  // Version 14: The stack and locals are now typed.
  public static readonly CODE_VERSION_MINIMUM: number = 9;
  public static readonly CODE_VERSION_SM_LEGACY: number = 10;
  public static readonly CODE_VERSION_FEATURE_MASK: number = 13;
  public static readonly CODE_VERSION_TYPED_STACK: number = 14;
  public static readonly CODE_VERSION_CURRENT: number = CodeV1Header.CODE_VERSION_TYPED_STACK;
  public static readonly CODE_VERSION_ALWAYS_REJECT: number = 0x7f;

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
