import FileHeader from "../fileheader";
import SectionEntry from "../sectionentry";
import SmxSection from "./smxsection";

export default class SmxNameTable extends SmxSection {
    private names: { [index: number]: string };

    public constructor(file: FileHeader, section: SectionEntry) {
        super(file, section);
        this.names = {};
    }

    // Returns a string at a given index.
    public stringAt(index: number): string {
        if (this.names[index] != null) {
            return this.names[index];
        }

        if (index >= this.header.size) {
            throw new Error("invalid string index");
        }

        let length = 0;
        const array = new Uint8Array(this.file.sectionReader(this.header));
        for (let i = index; i < this.header.size; i++) {
            if (array[i] === 0) {
                break;
            }
            length++;
        }

        const value = new TextDecoder("utf-8").decode(array.slice(index, index + length));
        this.names[index] = value;
        return value;
    }
}
