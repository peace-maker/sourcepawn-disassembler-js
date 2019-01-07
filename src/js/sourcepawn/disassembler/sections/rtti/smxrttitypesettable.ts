import FileHeader from "../../fileheader";
import SectionEntry from "../../sectionentry";
import RttiTypesetEntry from "../../types/rtti/rttitypesetentry";
import SmxNameTable from "../smxnametable";
import SmxRttiListTable from "./smxrttilisttable";

export default class SmxRttiTypesetTable extends SmxRttiListTable {

    public typesets: RttiTypesetEntry[];

    public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
        super(file, section);

        const view = new DataView(file.sectionReader(section), this.headersize);
        this.typesets = [];
        for (let i = 0; i < this.rowcount; i++) {
            const entry = new RttiTypesetEntry();
            entry.nameoffs = view.getUint32(i * this.rowsize + 0, true);
            entry.signature = view.getUint32(i * this.rowsize + 4, true);
            entry.name = names.stringAt(entry.nameoffs);
            this.typesets[i] = entry;
        }
    }
}
