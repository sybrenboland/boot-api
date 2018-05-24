import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";


export class AddServiceManyPutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private mappingSide: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        const save = this.mappingSide ?
            `${this.oneClass} new${this.oneClass} = ${this.oneClass.toLowerCase()}Optional.get().toBuilder()
                        .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()}Optional.get())
                        .build();
                ${javaFunctions.lowercaseFirst(this.oneClass)}Repository.save(new${this.oneClass});` :
            `${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}Optional.get().toBuilder()
                        .${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()}Optional.get())
                        .build();
                ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.save(new${this.otherClass});`;

        const rawJavaMethod = `
    public boolean update${this.otherClass}With${this.oneClass}(long ${this.otherClass.toLowerCase()}Id, ` +
            `long ${this.oneClass.toLowerCase()}Id) {
        Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.` +
            `findById(${this.otherClass.toLowerCase()}Id);
        if (${this.otherClass.toLowerCase()}Optional.isPresent()) {

            Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ` +
            `${javaFunctions.lowercaseFirst(this.oneClass)}Repository.findById(${this.oneClass.toLowerCase()}Id);
            if (${this.oneClass.toLowerCase()}Optional.isPresent()) {

                ${save}
                return true;
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.otherClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "update" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);

            javaFunctions.addToConstructor(
                file,
                this.otherClass + "Service",
                this.oneClass + "Repository",
                javaFunctions.lowercaseFirst(this.oneClass) + "Repository");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.oneClass + "Repository");
            javaFunctions.addImport(file, "java.util.Optional");
        } else {
            console.error("Service class not added yet!");
        }
    }
}
