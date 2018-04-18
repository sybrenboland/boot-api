import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";

export class AddOtherSideOneBeanUni extends EditFunction {

    constructor(private mappedByClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @Input";
        const rawJavaCode = `@OneToOne(fetch = FetchType.LAZY)
    @MapsId
    private ${this.mappedByClass} ${this.mappedByClass.toLowerCase()};
    
    ` + inputHook;

        const beanPath = params.persistenceModule + params.basePath + "/persistence/db/hibernate/bean/" + this.otherClass + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class many side not added yet!");
        }
    }
}
