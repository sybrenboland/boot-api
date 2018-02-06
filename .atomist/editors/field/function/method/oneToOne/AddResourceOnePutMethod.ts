import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class AddResourceOnePutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @Override
    public ResponseEntity put${this.otherClass}With${this.oneClass}` +
            `(@PathVariable long ${this.oneClass.toLowerCase()}Id, ` +
            `@RequestBody Json${this.otherClass} json${this.otherClass}) {

        Json${this.otherClass} newJson${this.otherClass} = ${this.oneClass.toLowerCase()}Service.` +
            `update${this.oneClass}With${this.otherClass}(${this.oneClass.toLowerCase()}Id, ` +
            `json${this.otherClass});

        return  newJson${this.otherClass} != null ?
                ResponseEntity.ok(newJson${this.otherClass}) :
                ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/resource/" + this.oneClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, params.basePackage + ".domain.Json" + this.otherClass);
    }
}