import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {javaFunctions} from "../functions/JavaClassFunctions";

/**
 * AddPOST editor
 * - Adds maven dependencies
 * - Adds method to resource class and interface
 * - Adds method to service
 * - Adds method to converter
 *
 * Requires:
 * - Bean class
 * - Domain class
 * - Resource class and interface
 * - Service class
 * - Repository
 */
@Editor("AddPOST", "adds REST post method")
@Tags("rug", "api", "POST", "shboland")
export class AddPOST implements EditProject {
    @Parameter({
        displayName: "Class name",
        description: "Name of the class we want to add",
        pattern: Pattern.java_class,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public className: string;

    @Parameter({
        displayName: "Base package name",
        description: "Name of the base package in witch we want to add",
        pattern: Pattern.java_package,
        validInput: "Java package name",
        minLength: 0,
        maxLength: 100,
        required: true,
    })
    public basePackage: string;

    @Parameter({
        displayName: "Module name",
        description: "Name of the module we want to add",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public module: string = "api";

    public edit(project: Project) {

        const basePath = this.module + "/src/main/java/" + this.basePackage.replace(/\./gi, "/");

        this.addDependencies(project);
        this.addResourceInterfaceMethod(project, basePath);
        this.addResourceClassMethod(project, basePath);
        this.addServiceMethod(project, basePath);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-web");
        });
    }

    private addResourceInterfaceMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `    
    @RequestMapping(value = "", method = RequestMethod.POST)
    ResponseEntity post${this.className}(@RequestBody Json${this.className} ${this.className.toLowerCase()});`;

        const path = basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "post" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestBody");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.className);
    }

    private addResourceClassMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    @Override
    public ResponseEntity post${this.className}(@RequestBody Json${this.className} json${this.className}) {
        Json${this.className} new${this.className} = ` +
            `${this.className.toLowerCase()}Service.create${this.className}(json${this.className});

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest().path("/{id}")
                .buildAndExpand(new${this.className}.getId()).toUri();

        return ResponseEntity.created(location).build();
    }`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "post" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "java.net.URI");
        javaFunctions.addImport(file, "org.springframework.web.servlet.support.ServletUriComponentsBuilder");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestBody");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.className);
    }

    private addServiceMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    public Json${this.className} create${this.className}(Json${this.className} json${this.className}) {
        ${this.className} ${this.className.toLowerCase()} = ` +
            `${this.className.toLowerCase()}Repository.save(` +
            `${this.className.toLowerCase()}Converter.copyFields(json${this.className}, new ${this.className}()));

        return ${this.className.toLowerCase()}Converter.toJson(${this.className.toLowerCase()});
    }`;

        const path = basePath + "/service/" + this.className + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "create" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.className);
        javaFunctions.addImport(file, this.basePackage + ".db.hibernate.bean." + this.className);
    }
}

export const addPost = new AddPOST();
