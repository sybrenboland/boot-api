import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {javaFunctions} from "../functions/JavaClassFunctions";

/**
 * AddDELETE editor
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
@Editor("AddDELETE", "adds REST put method")
@Tags("rug", "api", "AddDELETE", "shboland")
export class AddDELETE implements EditProject {
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
    @RequestMapping(value = "/{${this.className.toLowerCase()}Id}", method = RequestMethod.DELETE)
    ResponseEntity delete${this.className}(@PathVariable("${this.className.toLowerCase()}Id") ` +
            `long ${this.className.toLowerCase()}Id);`;

        const path = basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }

    private addResourceClassMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    @Override
    public ResponseEntity delete${this.className}(@PathVariable long ${this.className.toLowerCase()}Id) {

        return ${this.className.toLowerCase()}Service.delete${this.className}(${this.className.toLowerCase()}Id) ?
                ResponseEntity.ok().build() :
                ResponseEntity.notFound().build();
    }`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }

    private addServiceMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean delete${this.className}(long ${this.className.toLowerCase()}Id) {
        ${this.className} ${this.className.toLowerCase()} = ${this.className.toLowerCase()}Repository.` +
            `findOne(${this.className.toLowerCase()}Id);

        if (${this.className.toLowerCase()} != null) {
            ${this.className.toLowerCase()}Repository.delete(${this.className.toLowerCase()});
            return true;
        } else {
            return false;
        }
    }`;

        const path = basePath + "/service/" + this.className + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".db.hibernate.bean." + this.className);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
    }
}

export const addDelete = new AddDELETE();
