import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddServiceGetMethodMany extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public ${this.oneClass} fetch${this.oneClass}For${this.otherClass}` +
            `(long ${this.otherClass.toLowerCase()}Id) {
        Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ${this.otherClass.toLowerCase()}Repository.findById` +
            `(${this.otherClass.toLowerCase()}Id);
        return ${this.otherClass.toLowerCase()}Optional.isPresent() && ${this.otherClass.toLowerCase()}Optional.get().` +
            `get${this.oneClass}() != null ? ${this.otherClass.toLowerCase()}Optional.get().get${this.oneClass}() : null;
    }`;

        const path = params.coreModule + params.basePath + "/service/" + this.oneClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "fetch" + this.oneClass + "sFor" + this.otherClass, rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);

        javaFunctions.addToConstructor(file, this.oneClass + "Service",
            this.otherClass.toLowerCase() + "Repository");
        javaFunctions.addImport(file, params.basePackage + ".db.repo." + this.otherClass + "Repository");
        javaFunctions.addImport(file, "java.util.Optional");
    }
}
