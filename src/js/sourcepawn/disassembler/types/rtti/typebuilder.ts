import SourcePawnFile from "../../sourcepawnfile";
import { TypeFlag } from "./typeflag";

export default class TypeBuilder {

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
    public decodeNew(): string {
        const wasConst = this.isConst;
        this.isConst = false;

        let result = this.decode();
        if (this.isConst) {
            result = "const " + result;
        }

        this.isConst = wasConst;
        return result;
    }

    public decodeFunction(): string {
        const argc = this.bytes[this.offset++];

        let variadic = false;
        if (this.bytes[this.offset] === TypeFlag.Variadic) {
            variadic = true;
            this.offset++;
        }

        let returnType = "";
        if (this.bytes[this.offset] === TypeFlag.Void) {
            returnType = "void";
            this.offset++;
        } else {
            returnType = this.decodeNew();
        }

        const argv = [];
        for (let i = 0; i < argc; i++) {
            const isByRef = this.match(TypeFlag.ByRef);
            let text = this.decodeNew();
            if (isByRef) {
                text += "&";
            }
            argv[i] = text;
        }

        let signature = "function" +
                        returnType + " (" +
                        argv.join(", ");
        if (variadic) {
            if (argc > 0) {
                signature += ", ";
            }
            signature += "...";
        }
        signature += ")";
        return signature;
    }

    private decode(): string {
        this.isConst = this.match(TypeFlag.Const) || this.isConst;

        const b = this.bytes[this.offset++];
        switch (b) {
            case TypeFlag.Bool: return "bool";
            case TypeFlag.Int32: return "int";
            case TypeFlag.Float32: return "float";
            case TypeFlag.Char8: return "char";
            case TypeFlag.Any: return "any";
            case TypeFlag.TopFunction: return "Function";
            case TypeFlag.FixedArray: {
                const view = new DataView(this.bytes, this.offset);
                const index = view.getUint32(0, true);
                this.offset += 4;
                const inner = this.decode();
                return inner + "[" + index + "]";
            }
            case TypeFlag.Array: {
                const inner = this.decode();
                return inner + "[]";
            }
            case TypeFlag.Enum: {
                const view = new DataView(this.bytes, this.offset);
                const index = view.getUint32(0, true);
                this.offset += 4;
                return this.smxFile.rttiEnums.enums[index].name;
            }
            case TypeFlag.Typedef: {
                const view = new DataView(this.bytes, this.offset);
                const index = view.getUint32(0, true);
                this.offset += 4;
                return this.smxFile.rttiTypedefs.typedefs[index].name;
            }
            case TypeFlag.Typeset: {
                const view = new DataView(this.bytes, this.offset);
                const index = view.getUint32(0, true);
                this.offset += 4;
                return this.smxFile.rttiTypesets.typesets[index].name;
            }
            case TypeFlag.Struct: {
                const view = new DataView(this.bytes, this.offset);
                const index = view.getUint32(0, true);
                this.offset += 4;
                return this.smxFile.rttiClassDefs.classdefs[index].name;
            }
            case TypeFlag.Function: return this.decodeFunction();
            case TypeFlag.EnumStruct: {
                const view = new DataView(this.bytes, this.offset);
                const index = view.getUint32(0, true);
                this.offset += 4;
                return this.smxFile.rttiEnumStructs.entries[index].name;
            }
        }
        throw new Error("unknown type code: " + b);
    }

    private match(b: number): boolean {
        if (this.bytes[this.offset] !== b) {
            return false;
        }
        this.offset++;
        return true;
    }
}
