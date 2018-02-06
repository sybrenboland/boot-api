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
        List<Json${this.otherClass}> json${this.otherClass}List = ` +
            `${this.otherClass.toLowerCase()}Service.fetch${this.otherClass}sFor${this.oneClass}` +
            `(${this.oneClass.toLowerCase()}Id);

        if (json${this.otherClass}List.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(json${this.otherClass}List);
        }
    }`;

        const path = params.apiModule + params.basePath + "/resource/" + this.oneClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.otherClass + "s", rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, params.basePackage + ".domain.Json" + this.otherClass);

        javaFunctions.addToConstructor(file, this.oneClass + "Controller",
            this.otherClass.toLowerCase() + "Service");
        javaFunctions.addImport(file, params.basePackage + ".service." + this.otherClass + "Service");
    }
}