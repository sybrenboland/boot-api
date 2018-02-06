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
        Json${this.oneClass} json${this.oneClass} = ${this.oneClass.toLowerCase()}Service` +
            `.fetch${this.oneClass}For${this.otherClass}(${this.otherClass.toLowerCase()}Id);

        return json${this.oneClass} != null ? ResponseEntity.ok(json${this.oneClass}) : ` +
            `ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/resource/" + this.otherClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.oneClass + "s", rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, params.basePackage + ".domain.Json" + this.oneClass);

        javaFunctions.addToConstructor(file, this.otherClass + "Controller",
            this.oneClass.toLowerCase() + "Service");
        javaFunctions.addImport(file, params.basePackage + ".service." + this.oneClass + "Service");
    }
}