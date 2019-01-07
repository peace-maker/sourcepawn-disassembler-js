import FileHeader from "../../fileheader";
import SectionEntry from "../../sectionentry";
import DebugVarEntry from "../../types/rtti/debugvarentry";
import SmxNameTable from "../smxnametable";
import SmxRttiListTable from "./smxrttilisttable";

export default class SmxDebugSymbolsTable extends SmxRttiListTable {

    public entries: DebugVarEntry[];
    public addressSortedEntries!: DebugVarEntry[];

    public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
        super(file, section);

        const view = new DataView(file.sectionReader(section), this.headersize);
        this.entries = [];
        let offset = 0;
        for (let i = 0; i < this.rowcount; i++) {
            const entry = new DebugVarEntry();
            entry.address = view.getUint32(offset + 0, true);
            entry.scope = view.getUint8(offset + 4) & 3;
            entry.nameoffs = view.getUint32(offset + 5, true);
            entry.codestart = view.getUint32(offset + 9, true);
            entry.codeend = view.getUint32(offset + 13, true);
            entry.typeid = view.getUint32(offset + 17, true);
            entry.name = names.stringAt(entry.nameoffs);
            this.entries[i] = entry;
            offset += DebugVarEntry.Size;
        }
    }

    protected EnsureSortedAddress(): void {
        if (this.addressSortedEntries != null) {
            return;
        }

        this.addressSortedEntries = this.entries;
        this.addressSortedEntries.sort((a, b) => a.address - b.address);
    }
}
