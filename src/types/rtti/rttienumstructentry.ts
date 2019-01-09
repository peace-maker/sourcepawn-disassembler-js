export class RttiEnumStructEntry {
  public static readonly Size: number = 12;

  // Offset into the .names section.
  public nameoffs!: number;

  // Index into rtti.fields section table.
  public firstField!: number;

  public size!: number;

  // Computed name.
  public name!: string;
}
