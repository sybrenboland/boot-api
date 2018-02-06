import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {javaFunctions} from "../../../functions/JavaClassFunctions";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";


export class AddResourcePutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @Override
    public ResponseEntity put${this.otherClass}With${this.oneClass}(@PathVariable long ` +
            `${this.oneClass.toLowerCase()}Id, @PathVariable long ${this.otherClass.toLowerCase()}Id) {

        return ${this.oneClass.toLowerCase()}Service.update${this.oneClass}With${this.otherClass}` +
            `(${this.oneClass.toLowerCase()}Id, ${this.otherClass.toLowerCase()}Id) ?
                ResponseEntity.ok().build() :
                ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/resource/" + this.oneClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }
}