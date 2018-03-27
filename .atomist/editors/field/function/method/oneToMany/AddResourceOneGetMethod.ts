import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";


export class AddResourceOneGetMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @Override
    public ResponseEntity get${this.otherClass}s(@PathVariable long ${this.oneClass.toLowerCase()}Id) {
        List<${this.otherClass}> ${this.otherClass.toLowerCase()}List = ` +
            `${this.otherClass.toLowerCase()}Service.fetch${this.otherClass}sFor${this.oneClass}` +
            `(${this.oneClass.toLowerCase()}Id);

        if (${this.otherClass.toLowerCase()}List.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(${this.otherClass.toLowerCase()}List.stream()` +
            `.map(${this.otherClass.toLowerCase()}Converter::toJson).collect(Collectors.toList()));
        }
    }`;

        const path = params.apiModule + params.basePath + "/resource/" + this.oneClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.otherClass + "s", rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, " java.util.stream.Collectors");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, params.basePackage + ".db.hibernate.bean." + this.otherClass);

        javaFunctions.addToConstructor(file, this.oneClass + "Controller",
            this.otherClass.toLowerCase() + "Service");
        javaFunctions.addImport(file, params.basePackage + ".service." + this.otherClass + "Service");

        javaFunctions.addToConstructor(file, this.oneClass + "Controller",
            this.otherClass.toLowerCase() + "Converter");
        javaFunctions.addImport(file, params.basePackage + ".convert." + this.otherClass + "Converter");
    }
}
