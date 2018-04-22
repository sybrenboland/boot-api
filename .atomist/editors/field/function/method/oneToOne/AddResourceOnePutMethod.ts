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

        ${this.otherClass} new${this.otherClass} = ${this.oneClass.toLowerCase()}Service.` +
            `update${this.oneClass}With${this.otherClass}(${this.oneClass.toLowerCase()}Id, ` +
            `${this.otherClass.toLowerCase()}Converter.fromJson(json${this.otherClass}));

        return  new${this.otherClass} != null ?
                ResponseEntity.ok(${this.otherClass.toLowerCase()}Converter.toJson(new${this.otherClass})) :
                ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/api/resource/" + this.oneClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, params.basePackage + ".domain.entities.Json" + this.otherClass);
        javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
        javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

        javaFunctions.addToConstructor(file, this.oneClass + "Controller",
<<<<<<< HEAD
            this.otherClass + "Converter",
            this.otherClass.toLowerCase() + "Converter");
=======
            this.otherClass + "Converter");
>>>>>>> e607361be03e877399aa279e611815ec37ebd38d
        javaFunctions.addImport(file, params.basePackage + ".api.convert." + this.otherClass + "Converter");
    }
}
