import $ from "jquery";
import SourcePawnFile from "./sourcepawn/disassembler/sourcepawnfile";

$("#fileinput").on("change", (evt: Event) => {
    if (evt == null) {
        return;
    }
    const elem = evt.target as HTMLInputElement;
    const files = elem.files; // FileList object
    if (files == null) {
        return;
    }

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < files.length; i++) {
        console.log(files[i].name);
        const sp: SourcePawnFile = new SourcePawnFile(files[i], () => {
            console.log(sp);
        });
    }
});
