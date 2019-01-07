import FileHeader from "../../fileheader";
import SectionEntry from "../../sectionentry";
import SmxSection from "../smxsection";

export default class SmxRttiListTable extends SmxSection {

    public headersize: number;
    public rowsize: number;
    public rowcount: number;

    public constructor(file: FileHeader, section: SectionEntry) {
        super(file, section);

        const view = new DataView(file.sectionReader(section));
        this.headersize = view.getUint32(0, true);
        this.rowsize = view.getUint32(4, true);
        this.rowcount = view.getUint32(8, true);
    }
}
