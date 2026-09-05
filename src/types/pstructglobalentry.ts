export class PStructGlobalEntry {
  public static readonly Size: number = 8;

  // Index into the name table.
  public nameoffs!: number;

  // First owned row in the pstruct_values table. This pstruct owns rows up
  // until the last pstruct row, or the next pstruct global's first row,
  // whichever comes first.
  public first_value!: number;

  // Computed name.
  public name!: string;
}
