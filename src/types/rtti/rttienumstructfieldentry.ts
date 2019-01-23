export class RttiEnumStructFieldEntry {
  public static readonly Size: number = 12;

  // Offset into the .names section.
  public nameoffs!: number;

  // Encoded type id.
  public typeid!: number;

  // Offset in the struct (array like).
  public offset!: number;

  // Computed name.
  public name!: string;
}
