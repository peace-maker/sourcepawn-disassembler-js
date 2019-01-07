import FileHeader from "../../fileheader";
import SectionEntry from "../../sectionentry";
import RttiNativeEntry from "../../types/rtti/rttinativeentry";
import SmxNameTable from "../smxnametable";
import SmxRttiListTable from "./smxrttilisttable";

export default class SmxRttiNativeTable extends SmxRttiListTable {

    public natives: RttiNativeEntry[];

    public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
        super(file, section);

        const view = new DataView(file.sectionReader(section), this.headersize);
        this.natives = [];
        for (let i = 0; i < this.rowcount; i++) {
            const entry = new RttiNativeEntry();
            entry.nameoffs = view.getUint32(i * this.rowsize + 0, true);
            entry.signature = view.getUint32(i * this.rowsize + 4, true);
            entry.name = names.stringAt(entry.nameoffs);
            this.natives[i] = entry;
        }
    }
}
