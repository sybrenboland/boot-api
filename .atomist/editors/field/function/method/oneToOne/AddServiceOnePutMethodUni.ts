import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddServiceOnePutMethodUni extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public ${this.otherClass} update${this.oneClass}With${this.otherClass}` +
            `(long ${this.oneClass.toLowerCase()}Id, ${this.otherClass} ${this.otherClass.toLowerCase()}) {
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ` +
            `${this.oneClass.toLowerCase()}Repository.findOne(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()} != null) {

            ${this.oneClass} new${this.oneClass} = ${this.oneClass.toLowerCase()}.toBuilder()
                    .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})
                    .build();
            ${this.oneClass.toLowerCase()}Repository.save(new${this.oneClass});

            return ${this.otherClass.toLowerCase()};
        }

        return null;
    }`;

        const path = params.coreModule + params.basePath + "/service/" + this.oneClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + this.oneClass + "With" + this.otherClass,
            rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.oneClass);
        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);
    }
}
