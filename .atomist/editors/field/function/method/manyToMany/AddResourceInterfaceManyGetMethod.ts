import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddResourceInterfaceGetMethodMany extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private pluralResource: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @RequestMapping(path = "/{${this.otherClass.toLowerCase()}Id}/${this.oneClass.toLowerCase()}` +
            `${this.pluralResource ? "s" : ""}", ` +
            `method = RequestMethod.GET)
    ResponseEntity get${this.oneClass}(@PathVariable long ${this.otherClass.toLowerCase()}Id);`;

        const path = params.apiModule + params.basePath + "/api/resource/I" + this.otherClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }
}
