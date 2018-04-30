import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddServiceOnePutMethodBi extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public ${this.otherClass} update${this.oneClass}With${this.otherClass}` +
            `(long ${this.oneClass.toLowerCase()}Id, ${this.otherClass} ${this.otherClass.toLowerCase()}) {
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()} = ` +
            `${javaFunctions.lowercaseFirst(this.oneClass)}Repository.findById(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()}.isPresent()) {

            ${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}.toBuilder()
                    .${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()}.get())
                    .build();
            
            return ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.save(new${this.otherClass});
        }

        return null;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.oneClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + this.oneClass + "With" + this.otherClass,
            rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
        javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

        javaFunctions.addToConstructor(
            file,
            this.oneClass + "Service",
            this.otherClass + "Repository",
            javaFunctions.lowercaseFirst(this.otherClass) + "Repository");
        javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
        javaFunctions.addImport(file, "java.util.Optional");
    }
}
