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
    @Transactional(propagation = Propagation.REQUIRED)
    public Json${this.oneClass} fetch${this.oneClass}For${this.otherClass}` +
            `(long ${this.otherClass.toLowerCase()}Id) {
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.findOne` +
            `(${this.otherClass.toLowerCase()}Id);
        return ${this.otherClass.toLowerCase()} != null && ${this.otherClass.toLowerCase()}.` +
            `get${this.oneClass}() != null ? ${this.oneClass.toLowerCase()}Converter.` +
            `toJson(${this.otherClass.toLowerCase()}.get${this.oneClass}()) : null;
    }`;

        const path = params.apiModule + params.basePath + "/service/" + this.oneClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "fetch" + this.oneClass + "sFor" + this.otherClass, rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".domain.Json" + this.oneClass);
        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");

        javaFunctions.addToConstructor(file, this.oneClass + "Service",
            this.otherClass.toLowerCase() + "Repository");
        javaFunctions.addImport(file, params.basePackage + ".db.repo." + this.otherClass + "Repository");
    }
}