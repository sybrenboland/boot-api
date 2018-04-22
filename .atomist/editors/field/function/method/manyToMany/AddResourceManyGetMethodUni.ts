import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";


export class AddResourceGetMethodManyUni extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @Override
    public ResponseEntity get${this.oneClass}(@PathVariable long ${this.otherClass.toLowerCase()}Id) {
        // Use only with @MapsId mapping
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ` +
            `${this.oneClass.toLowerCase()}Service.fetch${this.oneClass}(${this.otherClass.toLowerCase()}Id);

        return ${this.oneClass.toLowerCase()}Optional.isPresent() ? ResponseEntity` +
            `.ok(${this.oneClass.toLowerCase()}Optional.get()) : ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/api/resource/" + this.otherClass + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.oneClass + "s", rawJavaMethod);

        javaFunctions.addImport(file, "java.util.Optional");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, params.basePackage + ".domain.entities.Json" + this.oneClass);

        javaFunctions.addToConstructor(file, this.otherClass + "Controller",
            this.oneClass + "Service",
            this.oneClass.toLowerCase() + "Service");
        javaFunctions.addImport(file, params.basePackage + ".core.service." + this.oneClass + "Service");
    }
}
