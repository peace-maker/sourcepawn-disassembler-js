export class RttiMethodEntry {
  public static readonly Size: number = 24;

  // Offset into the .names section.
  public nameoffs!: number;

  // Start of method code in .code
  public pcodeStart!: number;

  // End of method code in .code
  public pcodeEnd!: number;

  // TypeId.
  public signature!: number;

  // Local variable signatures, or 0 if no locals.
  public locals!: number;

  // See RttiMethodFlags
  public flags!: number;

  // Computed name.
  public name!: string;
}
