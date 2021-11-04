import { SourcePawnFile } from '../sourcepawnfile';
import { V1Instruction } from './v1instruction';
import { V1Opcode } from './v1opcode';
import { V1OpcodeInfo } from './v1opcodeinfo';
import { V1Param } from './v1param';

export class V1Disassembler {
  public static Disassemble(smxFile: SourcePawnFile, procOffset: number) {
    const disassembler = new V1Disassembler(smxFile, procOffset);
    return disassembler.disassemble();
  }

  private static opcodeList: V1OpcodeInfo[] = [];

  private static prepareOpcode(op: V1Opcode, ...params: V1Param[]): void {
    this.opcodeList[op.valueOf()] = new V1OpcodeInfo(op, params);
  }

  private static fillOpcodeList(): void {
    if (this.opcodeList.length > 0) {
      return;
    }

    this.prepareOpcode(V1Opcode.ADD);
    this.prepareOpcode(V1Opcode.ADD_C, V1Param.Constant);
    this.prepareOpcode(V1Opcode.ADDR_ALT, V1Param.Stack);
    this.prepareOpcode(V1Opcode.ADDR_PRI, V1Param.Stack);
    this.prepareOpcode(V1Opcode.AND);
    this.prepareOpcode(V1Opcode.BOUNDS, V1Param.Constant);
    this.prepareOpcode(V1Opcode.BREAK);
    this.prepareOpcode(V1Opcode.CALL, V1Param.Function);
    this.prepareOpcode(V1Opcode.CASETBL, V1Param.Constant, V1Param.Jump);
    this.prepareOpcode(V1Opcode.CONST, V1Param.Address, V1Param.Constant);
    this.prepareOpcode(V1Opcode.CONST_ALT, V1Param.Constant);
    this.prepareOpcode(V1Opcode.CONST_PRI, V1Param.Constant);
    this.prepareOpcode(V1Opcode.CONST_S, V1Param.Stack, V1Param.Constant);
    this.prepareOpcode(V1Opcode.DEC, V1Param.Address);
    this.prepareOpcode(V1Opcode.DEC_ALT);
    this.prepareOpcode(V1Opcode.DEC_I);
    this.prepareOpcode(V1Opcode.DEC_PRI);
    this.prepareOpcode(V1Opcode.DEC_S, V1Param.Stack);
    this.prepareOpcode(V1Opcode.EQ);
    this.prepareOpcode(V1Opcode.EQ_C_ALT, V1Param.Constant);
    this.prepareOpcode(V1Opcode.EQ_C_PRI, V1Param.Constant);
    this.prepareOpcode(V1Opcode.FILL, V1Param.Constant);
    this.prepareOpcode(V1Opcode.GENARRAY, V1Param.Constant);
    this.prepareOpcode(V1Opcode.GENARRAY_Z, V1Param.Constant);
    this.prepareOpcode(V1Opcode.HALT, V1Param.Constant);
    this.prepareOpcode(V1Opcode.HEAP, V1Param.Constant);
    this.prepareOpcode(V1Opcode.IDXADDR);
    this.prepareOpcode(V1Opcode.IDXADDR_B, V1Param.Constant);
    this.prepareOpcode(V1Opcode.INC, V1Param.Address);
    this.prepareOpcode(V1Opcode.INC_ALT);
    this.prepareOpcode(V1Opcode.INC_I);
    this.prepareOpcode(V1Opcode.INC_PRI);
    this.prepareOpcode(V1Opcode.INC_S, V1Param.Stack);
    this.prepareOpcode(V1Opcode.INVERT);
    this.prepareOpcode(V1Opcode.JEQ, V1Param.Jump);
    this.prepareOpcode(V1Opcode.JNEQ, V1Param.Jump);
    this.prepareOpcode(V1Opcode.JNZ, V1Param.Jump);
    this.prepareOpcode(V1Opcode.JSGEQ, V1Param.Jump);
    this.prepareOpcode(V1Opcode.JSGRTR, V1Param.Jump);
    this.prepareOpcode(V1Opcode.JSLEQ, V1Param.Jump);
    this.prepareOpcode(V1Opcode.JSLESS, V1Param.Jump);
    this.prepareOpcode(V1Opcode.JUMP, V1Param.Jump);
    this.prepareOpcode(V1Opcode.JZER, V1Param.Jump);
    this.prepareOpcode(V1Opcode.LIDX);
    this.prepareOpcode(V1Opcode.LIDX_B, V1Param.Constant);
    this.prepareOpcode(V1Opcode.LOAD_ALT, V1Param.Address);
    this.prepareOpcode(V1Opcode.LOAD_BOTH, V1Param.Address, V1Param.Address);
    this.prepareOpcode(V1Opcode.LOAD_I);
    this.prepareOpcode(V1Opcode.LOAD_PRI, V1Param.Address);
    this.prepareOpcode(V1Opcode.LOAD_S_ALT, V1Param.Stack);
    this.prepareOpcode(V1Opcode.LOAD_S_BOTH, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.LOAD_S_PRI, V1Param.Stack);
    this.prepareOpcode(V1Opcode.LODB_I, V1Param.Constant);
    this.prepareOpcode(V1Opcode.LREF_S_ALT, V1Param.Stack);
    this.prepareOpcode(V1Opcode.LREF_S_PRI, V1Param.Stack);
    this.prepareOpcode(V1Opcode.MOVE_ALT);
    this.prepareOpcode(V1Opcode.MOVE_PRI);
    this.prepareOpcode(V1Opcode.MOVS, V1Param.Constant);
    this.prepareOpcode(V1Opcode.NEG);
    this.prepareOpcode(V1Opcode.NEQ);
    this.prepareOpcode(V1Opcode.NOP);
    this.prepareOpcode(V1Opcode.NOT);
    this.prepareOpcode(V1Opcode.OR);
    this.prepareOpcode(V1Opcode.POP_ALT);
    this.prepareOpcode(V1Opcode.POP_PRI);
    this.prepareOpcode(V1Opcode.PROC);
    this.prepareOpcode(V1Opcode.PUSH_ALT);
    this.prepareOpcode(V1Opcode.PUSH_PRI);
    this.prepareOpcode(V1Opcode.PUSH, V1Param.Address);
    this.prepareOpcode(V1Opcode.PUSH2, V1Param.Address, V1Param.Address);
    this.prepareOpcode(V1Opcode.PUSH3, V1Param.Address, V1Param.Address, V1Param.Address);
    this.prepareOpcode(V1Opcode.PUSH4, V1Param.Address, V1Param.Address, V1Param.Address, V1Param.Address);
    this.prepareOpcode(
      V1Opcode.PUSH5,
      V1Param.Address,
      V1Param.Address,
      V1Param.Address,
      V1Param.Address,
      V1Param.Address,
    );
    this.prepareOpcode(V1Opcode.PUSH_C, V1Param.Constant);
    this.prepareOpcode(V1Opcode.PUSH2_C, V1Param.Constant, V1Param.Constant);
    this.prepareOpcode(V1Opcode.PUSH3_C, V1Param.Constant, V1Param.Constant, V1Param.Constant);
    this.prepareOpcode(V1Opcode.PUSH4_C, V1Param.Constant, V1Param.Constant, V1Param.Constant, V1Param.Constant);
    this.prepareOpcode(
      V1Opcode.PUSH5_C,
      V1Param.Constant,
      V1Param.Constant,
      V1Param.Constant,
      V1Param.Constant,
      V1Param.Constant,
    );
    this.prepareOpcode(V1Opcode.PUSH_S, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH2_S, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH3_S, V1Param.Stack, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH4_S, V1Param.Stack, V1Param.Stack, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH5_S, V1Param.Stack, V1Param.Stack, V1Param.Stack, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH_ADR, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH2_ADR, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH3_ADR, V1Param.Stack, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH4_ADR, V1Param.Stack, V1Param.Stack, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.PUSH5_ADR, V1Param.Stack, V1Param.Stack, V1Param.Stack, V1Param.Stack, V1Param.Stack);
    this.prepareOpcode(V1Opcode.RETN);
    this.prepareOpcode(V1Opcode.SDIV);
    this.prepareOpcode(V1Opcode.SDIV_ALT);
    this.prepareOpcode(V1Opcode.SGEQ);
    this.prepareOpcode(V1Opcode.SGRTR);
    this.prepareOpcode(V1Opcode.SHL);
    this.prepareOpcode(V1Opcode.SHL_C_ALT, V1Param.Constant);
    this.prepareOpcode(V1Opcode.SHL_C_PRI, V1Param.Constant);
    this.prepareOpcode(V1Opcode.SHR);
    this.prepareOpcode(V1Opcode.SHR_C_ALT, V1Param.Constant);
    this.prepareOpcode(V1Opcode.SHR_C_PRI, V1Param.Constant);
    this.prepareOpcode(V1Opcode.SLEQ);
    this.prepareOpcode(V1Opcode.SLESS);
    this.prepareOpcode(V1Opcode.SMUL);
    this.prepareOpcode(V1Opcode.SMUL_C, V1Param.Constant);
    this.prepareOpcode(V1Opcode.SREF_S_ALT, V1Param.Stack);
    this.prepareOpcode(V1Opcode.SREF_S_PRI, V1Param.Stack);
    this.prepareOpcode(V1Opcode.SSHR);
    this.prepareOpcode(V1Opcode.STACK, V1Param.Constant);
    this.prepareOpcode(V1Opcode.STOR_ALT, V1Param.Address);
    this.prepareOpcode(V1Opcode.STOR_I);
    this.prepareOpcode(V1Opcode.STOR_PRI, V1Param.Address);
    this.prepareOpcode(V1Opcode.STOR_S_ALT, V1Param.Stack);
    this.prepareOpcode(V1Opcode.STOR_S_PRI, V1Param.Stack);
    this.prepareOpcode(V1Opcode.STRADJUST_PRI);
    this.prepareOpcode(V1Opcode.STRB_I, V1Param.Constant);
    this.prepareOpcode(V1Opcode.SUB);
    this.prepareOpcode(V1Opcode.SUB_ALT);
    this.prepareOpcode(V1Opcode.SWAP_ALT);
    this.prepareOpcode(V1Opcode.SWAP_PRI);
    this.prepareOpcode(V1Opcode.SWITCH, V1Param.Jump);
    this.prepareOpcode(V1Opcode.SYSREQ_C, V1Param.Native);
    this.prepareOpcode(V1Opcode.SYSREQ_N, V1Param.Native, V1Param.Constant);
    this.prepareOpcode(V1Opcode.TRACKER_POP_SETHEAP);
    this.prepareOpcode(V1Opcode.TRACKER_PUSH_C, V1Param.Constant);
    this.prepareOpcode(V1Opcode.XCHG);
    this.prepareOpcode(V1Opcode.XOR);
    this.prepareOpcode(V1Opcode.ZERO, V1Param.Address);
    this.prepareOpcode(V1Opcode.ZERO_ALT);
    this.prepareOpcode(V1Opcode.ZERO_PRI);
    this.prepareOpcode(V1Opcode.ZERO_S, V1Param.Stack);
    this.prepareOpcode(V1Opcode.REBASE, V1Param.Address, V1Param.Constant, V1Param.Constant);
    this.prepareOpcode(
      V1Opcode.INITARRAY_PRI,
      V1Param.Address,
      V1Param.Constant,
      V1Param.Constant,
      V1Param.Constant,
      V1Param.Constant,
    );
    this.prepareOpcode(
      V1Opcode.INITARRAY_ALT,
      V1Param.Address,
      V1Param.Constant,
      V1Param.Constant,
      V1Param.Constant,
      V1Param.Constant,
    );
    this.prepareOpcode(V1Opcode.HEAP_SAVE);
    this.prepareOpcode(V1Opcode.HEAP_RESTORE);
    this.prepareOpcode(V1Opcode.CASE, V1Param.Constant, V1Param.Jump);
  }

  private smxFile: SourcePawnFile;
  private data: DataView;
  private codeStart: number;
  private procOffset: number;
  private cursor: number;
  private cursorLimit: number;

  private constructor(smxFile: SourcePawnFile, procOffset: number) {
    V1Disassembler.fillOpcodeList();

    this.smxFile = smxFile;
    this.data = new DataView(smxFile.header.data);
    this.codeStart = smxFile.code.codeStartOffset();
    this.procOffset = procOffset;
    this.cursor = procOffset;
    this.cursorLimit = smxFile.code.codeheader.codesize;
  }

  private disassemble(): V1Instruction[] {
    const procOp = this.readNextOp();
    if (procOp !== V1Opcode.PROC) {
      throw new Error(`Function does not start with PROC at ${this.procOffset} (0x${procOp.toString(16)})`);
    }

    const insns = [];
    while (this.cursor < this.cursorLimit) {
      const address = this.cursor;
      const op = this.readNextOp();
      // Reached the end of the function.
      if (op === V1Opcode.PROC || op === V1Opcode.ENDPROC) {
        break;
      }

      const insn = new V1Instruction(address, V1Disassembler.opcodeList[op.valueOf()]);
      insns.push(insn);

      // CASETBL is special in that it is variable-length.
      if (op === V1Opcode.CASETBL) {
        const ncases = this.readNext();
        insn.params[0] = ncases;
        insn.params[1] = this.readNext();
        insn.bytes = this.data.buffer.slice(this.codeStart + address, this.codeStart + this.cursor);

        // Add seperate pseudo instructions for all case entries in the table.
        for (let i = 0; i < ncases; i++) {
          const caseAddr = this.cursor;
          const caseInsn = new V1Instruction(caseAddr, V1Disassembler.opcodeList[V1Opcode.CASE.valueOf()]);
          insns.push(caseInsn);

          const defval = this.readNext();
          const label = this.readNext();
          caseInsn.params[0] = defval;
          caseInsn.params[1] = label;
          caseInsn.bytes = this.data.buffer.slice(this.codeStart + caseAddr, this.codeStart + this.cursor);

          // Still add the case info to the casetbl,
          // since technically they are just parameters for that opcode.
          insn.params[2 + i * 2] = defval;
          insn.params[2 + i * 2 + 1] = label;
        }
        continue;
      }

      // Read the parameter info.
      for (let i = 0; i < insn.info.params.length; i++) {
        insn.params[i] = this.readNext();
      }

      insn.bytes = this.data.buffer.slice(this.codeStart + address, this.codeStart + this.cursor);

      if (op === V1Opcode.CALL) {
        const addr = insn.params[0];
        if (!this.smxFile.functionExists(addr)) {
          this.smxFile.calledFunctions.addFunction(addr);
        }
      }
    }
    return insns;
  }

  private readAt(offset: number): number {
    return this.data.getInt32(offset + this.codeStart, true);
  }

  private readNext(): number {
    const value = this.readAt(this.cursor);
    this.cursor += 4;
    return value;
  }

  private readNextOp(): V1Opcode {
    return this.readNext();
  }
}
