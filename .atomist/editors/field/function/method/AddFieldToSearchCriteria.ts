import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";


export class AddFieldToSearchCriteria extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @Input";
        const rawJavaCode = `private Optional<Long> ${this.oneClass.toLowerCase()}Id = Optional.empty();
    
    ` + inputHook;

        const path = params.persistenceModule + params.basePath + "/persistence/criteria/" + this.otherClass + "SearchCriteria.java";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("SearchCriteria class not added yet!");
        }
    }
}
