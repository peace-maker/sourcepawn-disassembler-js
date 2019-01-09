export class DataHeader {
  public static readonly Size: number = 12;

  // Size of the data blob.
  public datasize!: number;

  // Amount of memory the plugin runtime requires.
  public memorysize!: number;

  // Offset within this section to the data blob.
  public dataoffs!: number;
}
