export class RttiTypedefEntry {
  public static readonly Size: number = 8;

  // Offset into the .names section.
  public nameoffs!: number;

  // Encoded type id.
  public typeid!: number;

  // Computed name.
  public name!: string;
}
