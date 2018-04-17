import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";


export class AddServiceOnePutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public boolean update${this.oneClass}With${this.otherClass}(long ${this.oneClass.toLowerCase()}Id, ` +
            `long ${this.otherClass.toLowerCase()}Id) {
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ${this.oneClass.toLowerCase()}Repository.` +
            `findById(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()}Optional.isPresent()) {
            ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Optional.get();

            Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ` +
            `${this.otherClass.toLowerCase()}Repository.findById(${this.otherClass.toLowerCase()}Id);
            if (${this.otherClass.toLowerCase()}Optional.isPresent()) {

                List<${this.otherClass}> new${this.otherClass}List = ${this.oneClass.toLowerCase()}.get${this.otherClass}List();
                new${this.otherClass}List.add(${this.otherClass.toLowerCase()}Optional.get());
                
                ${this.oneClass} new${this.oneClass} = ${this.oneClass.toLowerCase()}.toBuilder()
                        .${this.otherClass.toLowerCase()}List(new${this.otherClass}List)
                        .build();
                ${this.oneClass.toLowerCase()}Repository.save(new${this.oneClass});
                return true;
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/service/" + this.oneClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + this.oneClass + "With" + this.otherClass, rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);

        javaFunctions.addToConstructor(file, this.oneClass + "Service",
            this.otherClass.toLowerCase() + "Repository");
        javaFunctions.addImport(file, params.basePackage + ".db.repo." + this.otherClass + "Repository");
    }
}
