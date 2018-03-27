import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";


export class AddServiceMappingPutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const innerPartMethod = javaFunctions.trueOfFalse(params.biDirectional) ?
            `${this.oneClass.toLowerCase()}.get${this.otherClass}Set().add(${this.otherClass.toLowerCase()});
                ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass.toLowerCase()});` :
            `${this.oneClass.toLowerCase()}.get${this.otherClass}Set().add(${this.otherClass.toLowerCase()});
                ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass.toLowerCase()});`;

        const rawJavaMethod = `
    public boolean update${this.oneClass}With${this.otherClass}(long ${this.oneClass.toLowerCase()}Id, ` +
            `long ${this.otherClass.toLowerCase()}Id) {
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.` +
            `findOne(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()} != null) {

            ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.` +
            `findOne(${this.otherClass.toLowerCase()}Id);
            if (${this.otherClass.toLowerCase()} != null) {

                ${innerPartMethod}
                return true;
            }
        }

        return false;
    }`;

        const path = params.apiModule + params.basePath + "/service/" + this.oneClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + this.oneClass + "With" + this.otherClass, rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);

        javaFunctions.addToConstructor(file, this.oneClass + "Service",
            this.otherClass.toLowerCase() + "Repository");
        javaFunctions.addImport(file, params.basePackage + ".db.repo." + this.otherClass + "Repository");
    }
}
