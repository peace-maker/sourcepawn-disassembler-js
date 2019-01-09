import { V1Opcode } from './v1opcode';
import { V1Param } from './v1param';

export class V1OpcodeInfo {
  public opcode: V1Opcode;

  public name: string;

  public params: V1Param[];

  public constructor(opcode: V1Opcode, params: V1Param[]) {
    this.opcode = opcode;
    this.name = V1Opcode[opcode].replace('_', '.').toLowerCase();
    this.params = params;
  }
}
