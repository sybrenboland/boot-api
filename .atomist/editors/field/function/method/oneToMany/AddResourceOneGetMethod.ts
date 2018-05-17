import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";


export class AddResourceOneGetMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @Override
    public ResponseEntity get${this.otherClass}s(@PathVariable long ${this.oneClass.toLowerCase()}Id) {
        List<${this.otherClass}> ${this.otherClass.toLowerCase()}List = ` +
            `${javaFunctions.lowercaseFirst(this.otherClass)}Service.fetch${this.otherClass}sFor${this.oneClass}` +
            `(${this.oneClass.toLowerCase()}Id);

        JsonSearchResult<Json${this.otherClass}> result = JsonSearchResult.<Json${this.otherClass}>builder()
                .results(${this.otherClass.toLowerCase()}List.stream().` +
            `map(${this.otherClass.toLowerCase()}Converter::toJson).collect(Collectors.toList()))
                .numberOfResults(${this.otherClass.toLowerCase()}List.size())
                .grandTotalNumberOfResults(${this.otherClass.toLowerCase()}List.size())
                .build();
        
        return ResponseEntity.ok(result);
    }`;

        const path = params.apiModule + params.basePath + "/api/resource/" + this.oneClass + "Controller.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "get" + this.otherClass + "s", rawJavaMethod);

            javaFunctions.addImport(file, "java.util.List");
            javaFunctions.addImport(file, " java.util.stream.Collectors");
            javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
            javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".domain.entities.Json" + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".domain.entities.JsonSearchResult");

            javaFunctions.addToConstructor(
                file,
                this.oneClass + "Controller",
                this.otherClass + "Service",
                javaFunctions.lowercaseFirst(this.otherClass) + "Service");
            javaFunctions.addImport(file, params.basePackage + ".core.service." + this.otherClass + "Service");

            javaFunctions.addToConstructor(
                file,
                this.oneClass + "Controller",
                this.otherClass + "Converter",
                javaFunctions.lowercaseFirst(this.otherClass) + "Converter");
            javaFunctions.addImport(file, params.basePackage + ".api.convert." + this.otherClass + "Converter");
        } else {
            console.error("Resource class not added yet!");
        }
    }
}
