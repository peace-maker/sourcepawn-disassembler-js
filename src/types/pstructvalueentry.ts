export class PStructValueEntry {
  public static readonly Size: number = 12;

  // Index into the name table.
  public field_nameoffs!: number;

  // Type descriptor for the contents.
  public type_id!: number;

  // For 32-bit scalars, contains the data value.
  // For anything else, a pointer to the data section.
  public fill_data!: number;

  // Computed name.
  public field_name!: string;
}
