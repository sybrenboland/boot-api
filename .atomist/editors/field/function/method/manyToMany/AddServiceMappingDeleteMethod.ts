import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";


export class AddServiceMappingDeleteMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public boolean remove${this.otherClass}(long ${this.oneClass.toLowerCase()}Id, ` +
            `long ${this.otherClass.toLowerCase()}Id) {
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ${this.oneClass.toLowerCase()}Repository.` +
            `findById(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()}Optional.isPresent()) {
            ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Optional.get();

            Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ${this.oneClass.toLowerCase()}.` +
            `get${this.otherClass}Set().stream()
                    .filter(${this.otherClass.toLowerCase()} -> ${this.otherClass.toLowerCase()}.getId() == ` +
            `${this.otherClass.toLowerCase()}Id).findFirst();

            if (${this.otherClass.toLowerCase()}Optional.isPresent()) {
            
                ${this.oneClass.toLowerCase()}.get${this.otherClass}Set().remove(${this.otherClass.toLowerCase()}Optional.get());
                ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass.toLowerCase()});
                return true;
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.oneClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "remove" + this.otherClass, rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
    }
}
