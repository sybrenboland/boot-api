import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddResourceInterfaceOnePutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @RequestMapping(value = "/{${this.oneClass.toLowerCase()}Id}/${this.otherClass.toLowerCase()}", ` +
            `method = RequestMethod.PUT)
    ResponseEntity put${this.otherClass}With${this.oneClass}` +
            `(@PathVariable("${this.oneClass.toLowerCase()}Id") long ${this.oneClass.toLowerCase()}Id, ` +
            `@RequestBody Json${this.otherClass} ${this.otherClass.toLowerCase()});`;

        const path = params.apiModule + params.basePath + "/resource/I" + this.oneClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, params.basePackage + ".domain.Json" + this.otherClass);
    }
}