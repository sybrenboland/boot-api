import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class OverrideSetter extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public void set${this.otherClass}(${this.otherClass} ${this.otherClass.toLowerCase()}) {
        if(${this.otherClass.toLowerCase()} != null) {
            ${this.otherClass.toLowerCase()}.set${this.oneClass}(this);
        }
        this.${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()};
    }`;

        const path = params.persistenceModule + params.basePath + "/db/hibernate/bean/" + this.oneClass + ".java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "set" + this.otherClass, rawJavaMethod);
    }
}