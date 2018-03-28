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
        const rawJavaCode = `@OneToMany(mappedBy = "${this.oneClass.toLowerCase()}")
    private List<${this.otherClass}> ${this.otherClass.toLowerCase()}List;
    
    ` + inputHook;

        const beanPath = params.persistenceModule + params.basePath + "/db/hibernate/bean/" + this.oneClass + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
            javaFunctions.addImport(beanFile, "java.util.List");
        } else {
            console.error("Bean class one side not added yet!");
        }
    }
}