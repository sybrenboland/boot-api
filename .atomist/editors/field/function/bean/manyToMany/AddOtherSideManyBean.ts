import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";


export class AddOtherSideManyBean extends EditFunction {

    constructor(private mappedByClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @Input";
        const rawJavaCode = `@ManyToMany
    @JoinTable(name = "${this.mappedByClass.toLowerCase()}_${this.otherClass.toLowerCase()}",
            joinColumns = @JoinColumn(name = "${this.otherClass.toLowerCase()}_id"),
            inverseJoinColumns = @JoinColumn(name = "${this.mappedByClass.toLowerCase()}_id")
    )
    private Set<${this.mappedByClass}> ${this.mappedByClass.toLowerCase()}Set = new HashSet<>();
    
    ` + inputHook;

        const beanPath = params.persistenceModule + params.basePath + "/db/hibernate/bean/" + this.otherClass + ".java";
        const file: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            file.replace(inputHook, rawJavaCode);
            javaFunctions.addImport(file, "java.util.Set");
            javaFunctions.addImport(file, "java.util.HashSet");
            javaFunctions.addImport(file, "javax.persistence.ManyToMany");
            javaFunctions.addImport(file, "javax.persistence.JoinColumn");
            javaFunctions.addImport(file, "javax.persistence.JoinTable");
        } else {
            console.error("Bean class other side not added yet!");
        }
    }
}