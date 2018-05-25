import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { Project } from "@atomist/rug/model/Project";

export class NoCreatePutResource extends EditFunction {

    constructor(private className: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        const basePath = params.apiModule + "/src/main/java/" + params.basePackage.replace(/\./gi, "/") + "/api";

        const rawJavaMethodOld = `saved${this.className} = ${this.className.toLowerCase()}Service` +
            `.save(${this.className.toLowerCase()}Converter.fromJson(json${this.className}));`;

        const rawJavaMethodNew = `return ResponseEntity.badRequest().build();`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);

        if (file.contains(rawJavaMethodOld)) {
            file.replace(rawJavaMethodOld, rawJavaMethodNew);
        }
    }
}
