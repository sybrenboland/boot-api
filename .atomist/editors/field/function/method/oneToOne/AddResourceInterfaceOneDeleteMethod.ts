import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddResourceInterfaceOneDeleteMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @RequestMapping(value = "/{${this.oneClass.toLowerCase()}Id}/${this.otherClass.toLowerCase()}", ` +
            `method = RequestMethod.DELETE)
    ResponseEntity delete${this.otherClass}With${this.oneClass}` +
            `(@PathVariable("${this.oneClass.toLowerCase()}Id") long ${this.oneClass.toLowerCase()}Id);`;

        const path = params.apiModule + params.basePath + "/api/resource/I" + this.oneClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }
}
