export class SectionEntry {
  // Offset into the string table.
  public nameoffs!: number;

  // Offset into the file for section contents.
  public dataoffs!: number;

  // Size of this section's contents.
  public size!: number;

  // Computed (not present on disk).
  public name!: string;
}
