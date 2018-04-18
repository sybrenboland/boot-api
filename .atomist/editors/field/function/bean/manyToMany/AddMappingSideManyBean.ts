import {EditFunction} from "../../EditFunction";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Params} from "../../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";


export class AddMappingSideManyBean extends EditFunction {

    constructor(private mappedByClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @Input";
        const rawJavaCode = `@ManyToMany(mappedBy = "${this.mappedByClass.toLowerCase()}Set")
    private Set<${this.otherClass}> ${this.otherClass.toLowerCase()}Set = new HashSet<>();
    
    ` + inputHook;

        const beanPath = params.persistenceModule + params.basePath + "/persistence/db/hibernate/bean/" + this.mappedByClass + ".java";
        const file: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            file.replace(inputHook, rawJavaCode);
            javaFunctions.addImport(file, "java.util.Set");
            javaFunctions.addImport(file, "java.util.HashSet");
        } else {
            console.error("Bean class mapping side not added yet!");
        }
    }
}
