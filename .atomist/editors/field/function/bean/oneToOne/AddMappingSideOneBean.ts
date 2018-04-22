import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddMappingSideOneBean extends EditFunction {

    constructor(private mappedByClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @Input";
        const rawJavaCode = `@OneToOne(mappedBy = "${this.mappedByClass.toLowerCase()}")
    private ${this.otherClass} ${this.otherClass.toLowerCase()};
    
    ` + inputHook;

        const beanPath = params.persistenceModule + params.basePath + "/persistence/db/hibernate/bean/" + this.mappedByClass + ".java";
        if (project.fileExists(beanPath)) {
            const file: File = project.findFile(beanPath);
            file.replace(inputHook, rawJavaCode);

            javaFunctions.addImport(file, "javax.persistence.OneToOne");
        } else {
            console.error("Bean class one side not added yet!");
        }
    }
}
