import FileHeader from "../fileheader";
import SectionEntry from "../sectionentry";
import DataHeader from "../types/dataheader";
import SmxSection from "./smxsection";

export default class SmxDataSection extends SmxSection {

    public dataheader: DataHeader;

    public constructor(file: FileHeader, section: SectionEntry) {
        super(file, section);

        const view = new DataView(file.sectionReader(section));
        this.dataheader = new DataHeader();
        this.dataheader.datasize = view.getUint32(0, true);
        this.dataheader.memorysize = view.getUint32(4, true);
        this.dataheader.dataoffs = view.getUint32(8, true);
    }

    public dataReader(): ArrayBuffer {
        const sectionData = this.file.sectionReader(this.header);
        return sectionData.slice(this.dataheader.dataoffs, this.dataheader.dataoffs + this.dataheader.datasize);
    }
}
