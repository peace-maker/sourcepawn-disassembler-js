import FileHeader from "../../fileheader";
import SectionEntry from "../../sectionentry";
import RttiFieldEntry from "../../types/rtti/rttifieldentry";
import SmxNameTable from "../smxnametable";
import SmxRttiListTable from "./smxrttilisttable";

export default class SmxRttiFieldTable extends SmxRttiListTable {

    public fields: RttiFieldEntry[];

    public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
        super(file, section);

        const view = new DataView(file.sectionReader(section), this.headersize);
        this.fields = [];
        for (let i = 0; i < this.rowcount; i++) {
            const entry = new RttiFieldEntry();
            entry.flags = view.getUint16(i * this.rowsize + 0, true);
            entry.nameoffs = view.getUint32(i * this.rowsize + 2, true);
            entry.typeid = view.getUint32(i * this.rowsize + 6, true);
            entry.name = names.stringAt(entry.nameoffs);
            this.fields[i] = entry;
        }
    }
}
