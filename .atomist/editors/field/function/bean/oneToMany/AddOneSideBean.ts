import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddOneSideBean extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @Input";
        const rawJavaCode = `@OneToMany(cascade = CascadeType.ALL, mappedBy = "${this.oneClass.toLowerCase()}")
    private List<${this.otherClass}> ${this.otherClass.toLowerCase()}List;
    
    ` + inputHook;

        const beanPath = params.persistenceModule + params.basePath + "/persistence/db/hibernate/bean/" + this.oneClass + ".java";
        if (project.fileExists(beanPath)) {
            const file: File = project.findFile(beanPath);
            file.replace(inputHook, rawJavaCode);

            javaFunctions.addImport(file, "java.util.List");
            javaFunctions.addImport(file, "javax.persistence.OneToMany");
            javaFunctions.addImport(file, "javax.persistence.CascadeType");
        } else {
            console.error("Bean class one side not added yet!");
        }
    }
}
