import { SourcePawnFile } from '../../sourcepawnfile';
import { RttiType } from './rttitype';
import { TypeFlag } from './typeflag';

export class TypeBuilder {
  public offset: number;
  private smxFile: SourcePawnFile;
  private bytes: Uint8Array;
  private isConst: boolean;

  public constructor(smxFile: SourcePawnFile, bytes: Uint8Array, offset: number) {
    this.smxFile = smxFile;
    this.bytes = bytes;
    this.offset = offset;
    this.isConst = false;
  }

  // Decode a type, but reset the |is_const| indicator for non-
  // dependent type.
  public decodeNew(): RttiType {
    const wasConst = this.isConst;
    this.isConst = false;

    const result = this.decode();
    if (this.isConst) {
      result.setConst();
    }

    this.isConst = wasConst;
    return result;
  }

  public decodeFunction(): RttiType {
    const argc = this.bytes[this.offset++];

    const func = new RttiType(TypeFlag.Function);
    if (this.bytes[this.offset] === TypeFlag.Variadic) {
      func.setVariadic();
      this.offset++;
    }

    if (this.bytes[this.offset] === TypeFlag.Void) {
      func.setInnerType(new RttiType(TypeFlag.Void));
      this.offset++;
    } else {
      func.setInnerType(this.decodeNew());
    }

    for (let i = 0; i < argc; i++) {
      const isConst = this.match(TypeFlag.Const);
      const isByRef = this.match(TypeFlag.ByRef);
      const arg = this.decodeNew();
      if (isConst) {
        arg.setConst();
      }
      if (isByRef) {
        arg.setByRef();
      }
      func.addArgument(arg);
    }
    return func;
  }

  public decodeTypeset(): RttiType {
    const typeset = new RttiType(TypeFlag.Typeset);
    const count = this.decodeUint32();

    for (let i = 0; i < count; i++) {
      typeset.addArgument(this.decodeNew());
    }
    return typeset;
  }

  private decode(): RttiType {
    this.isConst = this.match(TypeFlag.Const) || this.isConst;
    const isByRef = this.match(TypeFlag.ByRef);

    let type: RttiType;
    const b = this.bytes[this.offset++];
    switch (b) {
      case TypeFlag.Bool:
      case TypeFlag.Int32:
      case TypeFlag.Float32:
      case TypeFlag.Char8:
      case TypeFlag.Any:
      case TypeFlag.TopFunction: {
        type = new RttiType(b);
        break;
      }
      case TypeFlag.FixedArray: {
        type = new RttiType(b);
        type.setIndex(this.decodeUint32());
        type.setInnerType(this.decode());
        break;
      }
      case TypeFlag.Array: {
        type = new RttiType(b);
        type.setInnerType(this.decode());
        break;
      }
      case TypeFlag.Enum: {
        type = new RttiType(b);
        type.setIndex(this.decodeUint32());
        type.setRttiEntry(this.smxFile.rttiEnums.enums[type.index]);
        break;
      }
      case TypeFlag.Typedef: {
        type = new RttiType(b);
        type.setIndex(this.decodeUint32());
        type.setRttiEntry(this.smxFile.rttiTypedefs.typedefs[type.index]);
        break;
      }
      case TypeFlag.Typeset: {
        type = new RttiType(b);
        type.setIndex(this.decodeUint32());
        type.setRttiEntry(this.smxFile.rttiTypesets.typesets[type.index]);
        break;
      }
      case TypeFlag.Classdef: {
        type = new RttiType(b);
        type.setIndex(this.decodeUint32());
        type.setRttiEntry(this.smxFile.rttiClassDefs.classdefs[type.index]);
        break;
      }
      case TypeFlag.EnumStruct: {
        type = new RttiType(b);
        type.setIndex(this.decodeUint32());
        type.setRttiEntry(this.smxFile.rttiEnumStructs.entries[type.index]);
        break;
      }
      case TypeFlag.Function: {
        type = this.decodeFunction();
        break;
      }
      default: {
        throw new Error('unknown type code: ' + b);
      }
    }
    if (isByRef) {
      type.setByRef();
    }
    return type;
  }

  private match(b: number): boolean {
    if (this.bytes[this.offset] !== b) {
      return false;
    }
    this.offset++;
    return true;
  }

  private decodeUint32(): number {
    let value = 0;
    let shift = 0;
    while (true) {
      const b = this.bytes[this.offset++];
      value |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) {
        break;
      }
      shift += 7;
    }
    return value;
  }
}
