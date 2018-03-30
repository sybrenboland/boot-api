import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";


export class AddServiceOneGetMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    public List<${this.otherClass}> fetch${this.otherClass}sFor${this.oneClass}` +
            `(long ${this.oneClass.toLowerCase()}Id) {
        ${this.otherClass}SearchCriteria ${this.otherClass.toLowerCase()}SearchCriteria = ` +
            ` ${this.otherClass}SearchCriteria.builder()
                .${this.oneClass.toLowerCase()}Id(Optional.of(${this.oneClass.toLowerCase()}Id))
                .build();

        return ${this.otherClass.toLowerCase()}Repository.` +
            `findBySearchCriteria(${this.otherClass.toLowerCase()}SearchCriteria);
    }`;

        const path = params.coreModule + params.basePath + "/service/" + this.otherClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "fetch" + this.otherClass + "sFor" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);
    }
}
