import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";


export class AddServiceOtherDeleteMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public boolean remove${this.oneClass}(long ${this.otherClass.toLowerCase()}Id, ` +
            `long ${this.oneClass.toLowerCase()}Id) {
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.` +
            `findOne(${this.otherClass.toLowerCase()}Id);

        if (${this.otherClass.toLowerCase()} != null) {
            ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.` +
            `findOne(${this.oneClass.toLowerCase()}Id);
            if (${this.oneClass.toLowerCase()} != null) {

                ${this.otherClass.toLowerCase()}.get${this.oneClass}Set().remove(${this.oneClass.toLowerCase()});
                ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass.toLowerCase()});
                return true;
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/service/" + this.otherClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "remove" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.oneClass);
    }
}
