import FileHeader from "../fileheader";
import SectionEntry from "../sectionentry";
import CodeV1Header from "../types/codev1header";
import SmxSection from "./smxsection";

export default class SmxCodeV1Section extends SmxSection {

    public codeheader: CodeV1Header;

    public constructor(file: FileHeader, section: SectionEntry) {
        super(file, section);

        const view = new DataView(file.sectionReader(section));
        this.codeheader = new CodeV1Header();
        this.codeheader.codesize = view.getUint32(0, true);
        this.codeheader.cellsize = view.getUint8(4);
        this.codeheader.codeversion = view.getUint8(5);
        this.codeheader.flags = view.getUint16(6, true);
        this.codeheader.main = view.getUint32(8, true);
        this.codeheader.codeoffs = view.getUint32(12, true);
        if (this.codeheader.codeversion >= CodeV1Header.VERSION_FEATURES) {
            this.codeheader.features = view.getUint32(16, true);
        }
    }

    public codeReader(): ArrayBuffer {
        const sectionData = this.file.sectionReader(this.header);
        return sectionData.slice(this.codeheader.codeoffs, this.codeheader.codeoffs + this.codeheader.codesize);
    }

    public codeStartOffset(): number {
        return this.header.dataoffs + this.codeheader.codeoffs;
    }
}
