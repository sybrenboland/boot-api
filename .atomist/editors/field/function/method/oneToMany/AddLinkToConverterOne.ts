import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";


export class AddLinkToConverterOne extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @InputJsonField";
        const rawJavaCode = inputHook + `
        
        json${this.oneClass}.add(linkTo(${this.oneClass}Controller.class).` +
            `slash(${this.oneClass.toLowerCase()}.getId()).slash("/${this.otherClass.toLowerCase()}s")` +
            `.withRel("${this.otherClass.toLowerCase()}s"));`;

        const path = params.apiModule + params.basePath + "/convert/" + this.oneClass + "Converter.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawJavaCode);

            javaFunctions.addImport(file, params.basePackage + ".resource." + this.oneClass + "Controller");
            javaFunctions.addImport(file, "static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo");
        } else {
            console.error("Converter not added yet!");
        }
    }
}