export class RttiFieldEntry {
  public static readonly Size: number = 10;

  public flags!: number;

  // Offset into the .names section.
  public nameoffs!: number;

  // Encoded type id.
  public typeid!: number;

  // Computed name.
  public name!: string;
}
