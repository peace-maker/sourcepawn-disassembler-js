import FileHeader from "../fileheader";
import SectionEntry from "../sectionentry";
import NativeEntry from "../types/nativeentry";
import SmxNameTable from "./smxnametable";
import SmxSection from "./smxsection";

export default class SmxNativeTable extends SmxSection {

    public entries: NativeEntry[];

    public constructor(file: FileHeader, section: SectionEntry, names: SmxNameTable) {
        super(file, section);

        if (section.size % NativeEntry.Size !== 0) {
            throw new Error("invalid native table size");
        }

        const view = new DataView(file.sectionReader(section));
        const count = section.size / NativeEntry.Size;
        this.entries = [];
        for (let i = 0; i < count; i++) {
            const entry = new NativeEntry();
            entry.nameoffs = view.getInt32(i * NativeEntry.Size, true);
            entry.name = names.stringAt(entry.nameoffs);
            this.entries[i] = entry;
        }
    }
}
