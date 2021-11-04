import { V1OpcodeInfo } from './v1opcodeinfo';

export class V1Instruction {
  public address: number;
  public info: V1OpcodeInfo;
  public params: number[];
  public bytes!: ArrayBuffer;

  public constructor(address: number, info: V1OpcodeInfo) {
    this.address = address;
    this.info = info;
    this.params = [];
  }
}
