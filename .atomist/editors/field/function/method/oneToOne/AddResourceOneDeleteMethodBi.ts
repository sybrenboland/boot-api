import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddResourceOneDeleteMethodBi extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @Override
    public ResponseEntity delete${this.otherClass}With${this.oneClass}(@PathVariable long ` +
            `${this.oneClass.toLowerCase()}Id) {

        return ${this.oneClass.toLowerCase()}Service.remove${this.otherClass}` +
            `(${this.oneClass.toLowerCase()}Id) ?
                ResponseEntity.ok().build() :
                ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/resource/" + this.oneClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }
}