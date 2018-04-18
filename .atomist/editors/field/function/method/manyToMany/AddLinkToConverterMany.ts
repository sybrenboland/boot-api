import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddLinkToConverterMany extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private pluralResource: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "// @InputLink";
        const rawJavaCode = `json${this.otherClass}.add(linkTo(${this.otherClass}Controller.class).` +
            `slash(${this.otherClass.toLowerCase()}.getId()).slash("/${this.oneClass.toLowerCase()}` +
            `${this.pluralResource ? "s" : ""}")` +
            `.withRel("${this.oneClass.toLowerCase()}"));
            ` + inputHook;

        const path = params.apiModule + params.basePath + "/api/convert/" + this.otherClass + "Converter.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawJavaCode);

            javaFunctions.addImport(file, params.basePackage + ".api.resource." + this.otherClass + "Controller");
            javaFunctions.addImport(file, "static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo");
        } else {
            console.error("Converter not added yet!");
        }
    }
}
