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
    @Transactional(propagation = Propagation.REQUIRED)
    public Json${this.otherClass} update${this.oneClass}With${this.otherClass}` +
            `(long ${this.oneClass.toLowerCase()}Id, Json${this.otherClass} json${this.otherClass}) {
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ` +
            `${this.oneClass.toLowerCase()}Repository.findOne(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()} != null) {

            ${this.otherClass} ${this.otherClass.toLowerCase()} = ` +
            `${this.otherClass.toLowerCase()}Converter.copyFields(json${this.otherClass}, new ${this.otherClass}());
            ${this.otherClass.toLowerCase()}.set${this.oneClass}(${this.oneClass.toLowerCase()});
            ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass.toLowerCase()});

            return ${this.otherClass.toLowerCase()}Converter.toJson(${this.otherClass.toLowerCase()});
        }

        return null;
    }`;

        const path = params.apiModule + params.basePath + "/service/" + this.oneClass + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + this.oneClass + "With" + this.otherClass,
            rawJavaMethod);

        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
        javaFunctions.addImport(file, params.basePackage + ".domain.Json" + this.otherClass);

        javaFunctions.addToConstructor(file, this.oneClass + "Service",
            this.otherClass.toLowerCase() + "Repository");
        javaFunctions.addImport(file, params.basePackage + ".db.repo." + this.otherClass + "Repository");

        javaFunctions.addToConstructor(file, this.oneClass + "Service",
            this.otherClass.toLowerCase() + "Converter");
        javaFunctions.addImport(file, params.basePackage + ".convert." + this.otherClass + "Converter");
    }
}