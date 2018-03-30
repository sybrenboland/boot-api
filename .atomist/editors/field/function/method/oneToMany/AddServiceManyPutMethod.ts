import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";


export class AddServiceManyPutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public boolean update${this.otherClass}With${this.oneClass}(long ${this.otherClass.toLowerCase()}Id, ` +
            `long ${this.oneClass.toLowerCase()}Id) {
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.` +
            `findOne(${this.otherClass.toLowerCase()}Id);
        if (${this.otherClass.toLowerCase()} != null) {

            ${this.oneClass} ${this.oneClass.toLowerCase()} = ` +
            `${this.oneClass.toLowerCase()}Repository.findOne(${this.oneClass.toLowerCase()}Id);
            if (${this.oneClass.toLowerCase()} != null) {

                ${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}.toBuilder()
                        .${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()})
                        .build();
                ${this.otherClass.toLowerCase()}Repository.save(new${this.otherClass});
                return true;
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/service/" + this.otherClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.oneClass);

        javaFunctions.addToConstructor(file, this.otherClass + "Service",
            this.oneClass.toLowerCase() + "Repository");
        javaFunctions.addImport(file, params.basePackage + ".db.repo." + this.oneClass + "Repository");
    }
}
