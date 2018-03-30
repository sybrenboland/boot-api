import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {addServiceMethodFetchBean} from "./AddGET";
import {javaFunctions} from "../functions/JavaClassFunctions";
import { addServiceMethodSaveBean } from "./AddPOST";

/**
 * AddPUT editor
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
@Editor("AddPUT", "adds REST put method")
@Tags("rug", "api", "AddPUT", "shboland")
export class AddPUT implements EditProject {
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
    public apiModule: string = "api";

    @Parameter({
        displayName: "Core apiModule name",
        description: "Name of the apiModule with the business logic",
        pattern: Pattern.any,
        validInput: "Just a name",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public coreModule: string = "core";

    public edit(project: Project) {

        const basePathApi = this.apiModule + "/src/main/java/" + this.basePackage.replace(/\./gi, "/");
        const basePathCore = this.coreModule + "/src/main/java/" + this.basePackage.replace(/\./gi, "/");

        this.addDependencies(project);
        this.addResourceInterfaceMethod(project, basePathApi);
        this.addResourceClassMethod(project, basePathApi);
        addServiceMethodFetchBean(project, this.className, this.basePackage, basePathCore);
        addServiceMethodSaveBean(project, this.className, this.basePackage, basePathCore);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-web");
        });
    }

    private addResourceInterfaceMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `    
    @RequestMapping(value = "/{${this.className.toLowerCase()}Id}", method = RequestMethod.PUT)
    ResponseEntity put${this.className}(` +
            `@PathVariable("${this.className.toLowerCase()}Id") long ${this.className.toLowerCase()}Id, ` +
            `@RequestBody Json${this.className} json${this.className});`;

        const path = basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestBody");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.className);
    }

    private addResourceClassMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    @Override
    public ResponseEntity<Json${this.className}> put${this.className}` +
            `(@PathVariable long ${this.className.toLowerCase()}Id, ` +
            `@RequestBody Json${this.className} json${this.className}) {

        Optional<${this.className}> ${this.className.toLowerCase()}Optional = ${this.className.toLowerCase()}Service` +
            `.fetch${this.className}(${this.className.toLowerCase()}Id);

        ${this.className} saved${this.className};
        if (!${this.className.toLowerCase()}Optional.isPresent()) {
            saved${this.className} = ${this.className.toLowerCase()}Service` +
            `.save(${this.className.toLowerCase()}Converter.fromJson(json${this.className}));
        } else {
            saved${this.className} = ${this.className.toLowerCase()}Service` +
            `.save(${this.className.toLowerCase()}Converter.fromJson(json${this.className}, ${this.className.toLowerCase()}Id));
        }

        return ResponseEntity.ok(${this.className.toLowerCase()}Converter.toJson(saved${this.className}));
    }`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "java.util.Optional");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestBody");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.className);
    }
}

export const addPut = new AddPUT();
