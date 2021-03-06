import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

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
        if (project.fileExists(beanPath)) {
            const file: File = project.findFile(beanPath);
            file.replace(inputHook, rawJavaCode);

            javaFunctions.addImport(file, "javax.persistence.OneToOne");
            javaFunctions.addImport(file, "javax.persistence.FetchType");
            javaFunctions.addImport(file, "javax.persistence.MapsId");
        } else {
            console.error("Bean class many side not added yet!");
        }
    }
}
