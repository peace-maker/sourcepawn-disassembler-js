import FileHeader from "../../fileheader";
import SectionEntry from "../../sectionentry";
import DebugMethodEntry from "../../types/rtti/debugmethodentry";
import SmxRttiListTable from "./smxrttilisttable";

export default class SmxDebugMethodTable extends SmxRttiListTable {

    public entries: DebugMethodEntry[];

    public constructor(file: FileHeader, section: SectionEntry) {
        super(file, section);

        const view = new DataView(file.sectionReader(section), this.headersize);
        this.entries = [];
        for (let i = 0; i < this.rowcount; i++) {
            const entry = new DebugMethodEntry();
            entry.methodIndex = view.getInt32(i * this.rowsize + 0, true);
            entry.firstLocal = view.getInt32(i * this.rowsize + 4, true);
            this.entries[i] = entry;
        }
    }
}
