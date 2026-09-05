export class RttiGlobalsEntry {
  public static readonly Size: number = 12;

  // Offset into the .names section.
  public nameoffs!: number;
  
  // Encoded type id.
  public typeid!: number;

  // See RttiGlobalsFlags constants.
  public flags!: number;

  // Computed name.
  public name!: string;
}
