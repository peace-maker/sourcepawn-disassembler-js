
enum TagFlags {
    Fixed = 0x40000000,
    Func = 0x20000000,
    Object = 0x10000000,
    Enum = 0x08000000,
    Methodmap = 0x04000000,
    Struct = 0x02000000,
}

export default class TagEntry {
    public static readonly Size: number = 8;

    // Various tags that can be on a tag id.
    public readonly FIXED: number = 0x40000000;
    public readonly FUNC: number = 0x20000000;
    public readonly OBJECT: number = 0x10000000;
    public readonly ENUM: number = 0x08000000;
    public readonly METHODMAP: number = 0x04000000;
    public readonly STRUCT: number = 0x02000000;
    public readonly FLAGMASK: number =
            (this.FIXED | this.FUNC | this.OBJECT | this.ENUM | this.METHODMAP | this.STRUCT);

    // Tag ID from the compiler.
    public tag!: number;

    // Offset into the .names section.
    public nameoffs!: number;

    // Computed name.
    public name!: string;

    get id(): number {
        return this.tag & ~this.FLAGMASK;
    }

    get flags(): TagFlags {
        return (this.tag & this.FLAGMASK) as TagFlags;
    }
}
