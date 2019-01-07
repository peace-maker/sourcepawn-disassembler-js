import FileHeader from "../fileheader";
import SectionEntry from "../sectionentry";
import DebugLineEntry from "../types/debuglineentry";
import SmxSection from "./smxsection";

export default class SmxDebugLineTable extends SmxSection {

    public entries: DebugLineEntry[];

    public constructor(file: FileHeader, section: SectionEntry) {
        super(file, section);

        if (section.size % DebugLineEntry.Size !== 0) {
            throw new Error("invalid debug line table size");
        }

        const view = new DataView(file.sectionReader(section));
        const count = section.size / DebugLineEntry.Size;
        this.entries = [];
        for (let i = 0; i < count; i++) {
            const entry = new DebugLineEntry();
            entry.address = view.getUint32(i * DebugLineEntry.Size, true);
            entry.line = view.getUint32(i * DebugLineEntry.Size + 4, true);
            this.entries[i] = entry;
        }
    }

    public findLine(addr: number): number {
        let high = this.entries.length;
        let low = -1;

        while (high - low > 1) {
            const mid = (low + high) / 2;
            if (this.entries[mid].address <= addr) {
                low = mid;
            } else {
                high = mid;
            }
        }

        // "Since the CIP occurs BEFORE the line, we have to add one"
        return this.entries[low].line + 1;
    }
}
