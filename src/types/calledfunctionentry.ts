export class CalledFunctionEntry {
  public address: number;
  public name: string;

  public constructor(address: number) {
    this.address = address;
    this.name = `sub_${address.toString(16)}`;
  }
}
