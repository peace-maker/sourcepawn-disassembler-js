import FileHeader from "../fileheader";
import SectionEntry from "../sectionentry";
import PubvarEntry from "../types/pubvarentry";
import SmxNameTable from "./smxnametable";
import SmxSection from "./smxsection";

export default class SmxPubvarTable extends SmxSection {

    public entries: PubvarEntry[];

    public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
        super(file, section);

        if (section.size % PubvarEntry.Size !== 0) {
            throw new Error("invalid pubvar table size");
        }

        const view = new DataView(file.sectionReader(section));
        const count = section.size / PubvarEntry.Size;
        this.entries = [];
        for (let i = 0; i < count; i++) {
            const entry = new PubvarEntry();
            entry.address = view.getUint32(i * PubvarEntry.Size, true);
            entry.nameoffs = view.getUint32(i * PubvarEntry.Size + 4, true);
            entry.name = names.stringAt(entry.nameoffs);
            this.entries[i] = entry;
        }
    }
}
