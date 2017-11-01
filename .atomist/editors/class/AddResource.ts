import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";

/**
 * AddResource editor
 * - Adds maven dependencies
 * - Adds resource shell class and interface
 */
@Editor("AddResource", "adds resource class and interface")
@Tags("rug", "api", "resource", "shboland")
export class AddResource implements EditProject {
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
        this.addResourceInterface(project, basePath);
        this.addResourceClass(project, basePath);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-web");
        });
    }

    private addResourceInterface(project: Project, basePath: string): void {

        const rawJavaFileContent = `package ${this.basePackage + ".resource"};

import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/${this.className.toLowerCase()}s")
public interface I${this.className}Controller {

    // @Input
    
}`;

        const pathInterface = basePath + "/resource/I" + this.className + "Controller.java";
        if (!project.fileExists(pathInterface)) {
            project.addFile(pathInterface, rawJavaFileContent);
        }
    }

    private addResourceClass(project: Project, basePath: string): void {

        const rawJavaFileContent = `package ${this.basePackage}.resource;

import ${this.basePackage}.service.${this.className}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ${this.className}Controller implements I${this.className}Controller {

    private final ${this.className}Service ${this.className.toLowerCase()}Service;

    @Autowired
    public ${this.className}Controller(${this.className}Service ${this.className.toLowerCase()}Service) {
        this.${this.className.toLowerCase()}Service = ${this.className.toLowerCase()}Service;
    }
    
    // @Input
    
}`;

        const pathClass = basePath + "/resource/" + this.className + "Controller.java";
        if (!project.fileExists(pathClass)) {
            project.addFile(pathClass, rawJavaFileContent);
        }
    }
}

export const addResource = new AddResource();
