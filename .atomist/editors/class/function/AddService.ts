import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";

/**
 * AddService editor
 * - Adds service shell class
 */
@Editor("AddService", "adds service class")
@Tags("rug", "api", "service", "shboland")
export class AddService implements EditProject {
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
        required: false,
    })
    public basePackage: string = "org.shboland";

    @Parameter({
        displayName: "Module name",
        description: "Name of the module we want to add",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public module: string = "core";

    public edit(project: Project) {
        const basePath = this.module + "/src/main/java/" +
            this.basePackage.replace(/\./gi, "/") + "/core";

        this.addServiceClass(project, basePath);
    }

    private addServiceClass(project: Project, basePath: string): void {

        const rawJavaFileContent = `package ${this.basePackage}.core.service;

import ${this.basePackage}.persistence.db.repo.${this.className}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(propagation = Propagation.REQUIRED)
public class ${this.className}Service {

    private final ${this.className}Repository ${this.className.toLowerCase()}Repository;
    // @FieldInput

    @Autowired
    public ${this.className}Service(${this.className}Repository ${this.className.toLowerCase()}Repository) {
        this.${this.className.toLowerCase()}Repository = ${this.className.toLowerCase()}Repository;
        // @ConstructorInput
    }
    
    // @Input
    
}`;

        const pathService = basePath + "/service/" + this.className + "Service.java";
        if (!project.fileExists(pathService)) {
            project.addFile(pathService, rawJavaFileContent);
        }
    }
}

export const addService = new AddService();
