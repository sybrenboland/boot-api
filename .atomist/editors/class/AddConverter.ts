import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../functions/FileFunctions";
import {javaFunctions} from "../functions/JavaClassFunctions";

/**
 * AddConverter editor
 * - Adds converter shell class
 */
@Editor("AddConverter", "adds converter class")
@Tags("rug", "api", "convert", "shboland")
export class AddConverter implements EditProject {
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
        const basePath = this.module + "/src/main/java/" + fileFunctions.toPath(this.basePackage);

        this.addDependencies(project);
        this.addConverterClass(project, basePath);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-hateoas");
        });
    }

    private addConverterClass(project: Project, basePath: string): void {

        const rawJavaFileContent = `package ${this.basePackage}.convert;

import ${this.basePackage}.db.hibernate.bean.${this.className};
import ${this.basePackage}.domain.Json${this.className};
import ${this.basePackage}.resource.${this.className}Controller;
import org.springframework.stereotype.Service;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;

@Service
public class ${this.className}Converter {

    public Json${this.className} toJson(${this.className} ${this.className.toLowerCase()}) {
        Json${this.className} json${this.className} = new Json${this.className}();

        // @InputJsonField
        
        json${this.className}.add(linkTo(${this.className}Controller.class)` +
            `.slash(${this.className.toLowerCase()}.getId()).withSelfRel());

        return json${this.className};
    }
    
    public ${this.className} copyFields(Json${this.className} ${this.className.toLowerCase()}From, ` +
            `${this.className} ${this.className.toLowerCase()}To) {
        // @InputBeanField

        return ${this.className.toLowerCase()}To;
    }
}`;

        const pathConverter = basePath + "/convert/" + this.className + "Converter.java";
        if (!project.fileExists(pathConverter)) {
            project.addFile(pathConverter, rawJavaFileContent);
        }
    }
}

export const addConverter = new AddConverter();
