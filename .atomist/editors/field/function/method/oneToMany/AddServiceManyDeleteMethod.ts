import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddServiceManyDeleteMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public boolean remove${this.oneClass}(long ${this.otherClass.toLowerCase()}Id, ` +
            `long ${this.oneClass.toLowerCase()}Id) {
        Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ${this.otherClass.toLowerCase()}Repository.` +
            `findById(${this.otherClass.toLowerCase()}Id);
        if (${this.otherClass.toLowerCase()}Optional.isPresent()) {
            ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Optional.get();
         
            if (${this.otherClass.toLowerCase()}.get${this.oneClass}() != null) {

                Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ` +
                `${this.oneClass.toLowerCase()}Repository.findById(${this.oneClass.toLowerCase()}Id);
                if (${this.oneClass.toLowerCase()}Optional.isPresent() && ${this.oneClass.toLowerCase()}Optional.get().getId().` +
                `equals(${this.otherClass.toLowerCase()}.get${this.oneClass}().getId())) {
    
                    ${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}.toBuilder()
                            .${this.oneClass.toLowerCase()}(null)
                            .build();
                    ${this.otherClass.toLowerCase()}Repository.save(new${this.otherClass});
                    return true;
                }
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.otherClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "remove" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
        javaFunctions.addImport(file, "java.util.Optional");
    }
}
