import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddServiceOneDeleteMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public boolean remove${this.otherClass}(long ${this.oneClass.toLowerCase()}Id, ` +
            `long ${this.otherClass.toLowerCase()}Id) {
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ${javaFunctions.lowercaseFirst(this.oneClass)}Repository.` +
            `findById(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()}Optional.isPresent()) {
            ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Optional.get();

            Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ` +
            `${javaFunctions.lowercaseFirst(this.otherClass)}Repository.findById(${this.otherClass.toLowerCase()}Id);
            if (${this.otherClass.toLowerCase()}Optional.isPresent()) {
                ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Optional.get();

                if (${this.otherClass.toLowerCase()}.get${this.oneClass}() != null && ` +
                `${this.oneClass.toLowerCase()}.getId().equals(${this.otherClass.toLowerCase()}.get${this.oneClass}().getId())) {
    
                    ${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}.toBuilder()
                            .${this.oneClass.toLowerCase()}(null)
                            .build();
                    ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.save(new${this.otherClass});
                    return true;
                }
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.oneClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "remove" + this.otherClass, rawJavaMethod);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

            javaFunctions.addToConstructor(
                file,
                this.oneClass + "Service",
                this.otherClass + "Repository",
                javaFunctions.lowercaseFirst(this.otherClass) + "Repository");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
            javaFunctions.addImport(file, "java.util.Optional");
        } else {
            console.error("Service class not added yet!");
        }
    }
}
