import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";

export class AddMappingSideOneBean extends EditFunction {

    constructor(private mappedByClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @Input";
        const rawJavaCode = `@OneToOne(mappedBy = "${this.mappedByClass.toLowerCase()}")
    private ${this.otherClass} ${this.otherClass.toLowerCase()};
    
    ` + inputHook;

        const beanPath = params.persistenceModule + params.basePath + "/db/hibernate/bean/" + this.mappedByClass + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class one side not added yet!");
        }
    }
}