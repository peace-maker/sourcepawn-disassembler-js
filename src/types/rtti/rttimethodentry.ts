export class RttiMethodEntry {
  public static readonly Size: number = 16;

  // Offset into the .names section.
  public nameoffs!: number;

  // Start of method code in .code
  public pcodeStart!: number;

  // End of method code in .code
  public pcodeEnd!: number;

  // TypeId.
  public signature!: number;

  // Computed name.
  public name!: string;
}
