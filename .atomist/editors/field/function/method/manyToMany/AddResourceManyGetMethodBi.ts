import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddResourceGetMethodManyBi extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @Override
    public ResponseEntity get${this.oneClass}(@PathVariable long ${this.otherClass.toLowerCase()}Id) {
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Service` +
            `.fetch${this.oneClass}For${this.otherClass}(${this.otherClass.toLowerCase()}Id);

        return ${this.oneClass.toLowerCase()} != null ? 
                    ResponseEntity.ok(${this.oneClass.toLowerCase()}Converter.toJson(${this.oneClass.toLowerCase()})) : 
                    ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/resource/" + this.otherClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.oneClass + "s", rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.oneClass);
        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);

        javaFunctions.addToConstructor(file, this.otherClass + "Controller",
            this.oneClass.toLowerCase() + "Service");
        javaFunctions.addImport(file, params.basePackage + ".service." + this.oneClass + "Service");

        javaFunctions.addToConstructor(file, this.otherClass + "Controller",
            this.oneClass.toLowerCase() + "Converter");
        javaFunctions.addImport(file, params.basePackage + ".convert." + this.oneClass + "Converter");
    }
}