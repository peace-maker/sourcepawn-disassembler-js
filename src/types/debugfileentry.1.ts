export class DebugFileEntry {
  public static readonly Size: number = 8;

  // Offset into the code section.
  public address!: number;

  // Offset into the .dbg.names section.
  public nameoffs!: number;

  // Computed name.
  public name!: string;
}
