import { CalledFunctionEntry } from '../types/calledfunctionentry';

export class SmxCalledFunctionTable {
  public functions: CalledFunctionEntry[];

  public constructor() {
    this.functions = [];
  }

  public addFunction(addr: number): void {
    const entry = new CalledFunctionEntry(addr);
    this.functions.push(entry);
  }
}
