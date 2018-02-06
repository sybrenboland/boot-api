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
    @Transactional(propagation = Propagation.REQUIRED)
    public List<Json${this.otherClass}> fetch${this.otherClass}sFor${this.oneClass}` +
            `(long ${this.oneClass.toLowerCase()}Id) {
        ${this.otherClass}SearchCriteria ${this.otherClass.toLowerCase()}SearchCriteria = ` +
            `new ${this.otherClass}SearchCriteria();
        ${this.otherClass.toLowerCase()}SearchCriteria.set${this.oneClass}Id` +
            `(Optional.of(${this.oneClass.toLowerCase()}Id));
        List<${this.otherClass}> ${this.otherClass.toLowerCase()}List = ` +
            `${this.otherClass.toLowerCase()}Repository.` +
            `findBySearchCriteria(${this.otherClass.toLowerCase()}SearchCriteria);

        return ${this.otherClass.toLowerCase()}List.stream().` +
            `map(${this.otherClass.toLowerCase()}Converter::toJson).collect(Collectors.toList());
    }`;

        const path = params.apiModule + params.basePath + "/service/" + this.otherClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "fetch" + this.otherClass + "sFor" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, params.basePackage + ".domain.Json" + this.otherClass);
        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
    }
}