import { RttiClassDefEntry } from './rtticlassdefentry';
import { RttiEnumEntry } from './rttienumentry';
import { RttiEnumStructEntry } from './rttienumstructentry';
import { RttiTypedefEntry } from './rttitypedefentry';
import { RttiTypesetEntry } from './rttitypesetentry';
import { TypeFlag } from './typeflag';

export class RttiType {
  private isConst: boolean;
  private isVariadic: boolean;
  private isByRef: boolean;
  private typeflag: TypeFlag;
  private data: number;
  private innerType!: RttiType;
  private arguments: RttiType[];
  private rttiEntry!: any;

  public constructor(type: TypeFlag) {
    this.typeflag = type;
    this.data = 0;
    this.isConst = false;
    this.isVariadic = false;
    this.isByRef = false;
    this.arguments = [];
  }

  get type(): TypeFlag {
    return this.typeflag;
  }

  public setConst(): void {
    this.isConst = true;
  }

  get const(): boolean {
    return this.isConst;
  }

  public setVariadic(): void {
    this.isVariadic = true;
  }

  get variadic(): boolean {
    return this.isVariadic;
  }

  public setInnerType(inner: RttiType): void {
    this.innerType = inner;
  }

  get inner(): RttiType | null {
    return this.innerType;
  }

  public setByRef(): void {
    this.isByRef = true;
  }

  get byref(): boolean {
    return this.isByRef;
  }

  public addArgument(arg: RttiType): void {
    this.arguments.push(arg);
  }

  get args(): RttiType[] {
    return this.arguments;
  }

  public addSignature(signature: RttiType): void {
    this.arguments.push(signature);
  }

  get signatures(): RttiType[] {
    return this.arguments;
  }

  public setIndex(index: number): void {
    this.data = index;
  }

  get index(): number {
    return this.data;
  }

  get size(): number {
    return this.data;
  }

  public setRttiEntry(entry: any): void {
    this.rttiEntry = entry;
  }

  public toString(): string {
    let attributes = '';
    if (this.isConst) {
      attributes += 'const ';
    }
    if (this.isByRef) {
      attributes += '&';
    }
    switch (this.type) {
      case TypeFlag.Bool:
        return attributes + 'bool';
      case TypeFlag.Int32:
        return attributes + 'int';
      case TypeFlag.Float32:
        return attributes + 'float';
      case TypeFlag.Char8:
        return attributes + 'char';
      case TypeFlag.Any:
        return attributes + 'any';
      case TypeFlag.TopFunction:
        return attributes + 'Function';
      case TypeFlag.Void:
        return attributes + 'void';
      case TypeFlag.FixedArray:
        return attributes + this.innerType.toString() + '[' + this.index + ']';
      case TypeFlag.Array:
        return attributes + this.innerType.toString() + '[]';
      case TypeFlag.Enum: {
        if (this.rttiEntry) {
          const enumEntry = this.rttiEntry as RttiEnumEntry;
          return attributes + enumEntry.name;
        }
        return attributes + `<enum ${this.index}>`;
      }
      case TypeFlag.Typedef: {
        if (this.rttiEntry) {
          const typedef = this.rttiEntry as RttiTypedefEntry;
          return attributes + typedef.name;
        }
        return attributes + `<typedef ${this.index}>`;
      }
      case TypeFlag.Typeset: {
        if (this.rttiEntry) {
          const typeset = this.rttiEntry as RttiTypesetEntry;
          return attributes + typeset.name;
        }
        return attributes + `<typeset ${this.index}>`;
      }
      case TypeFlag.Classdef: {
        if (this.rttiEntry) {
          const classdef = this.rttiEntry as RttiClassDefEntry;
          return attributes + classdef.name;
        }
        return attributes + `<classdef ${this.index}>`;
      }
      case TypeFlag.EnumStruct: {
        if (this.rttiEntry) {
          const enumstruct = this.rttiEntry as RttiEnumStructEntry;
          return attributes + enumstruct.name;
        }
        return attributes + `<enumstruct ${this.index}>`;
      }
      case TypeFlag.Function: {
        const returnType = this.inner;
        let signature = `function ${returnType} (${this.args.join(', ')}`;
        if (this.isVariadic) {
          signature += '...';
        }
        signature += ')';
        return signature;
      }
    }

    return `<invalid type ${this.type}>`;
  }
}
