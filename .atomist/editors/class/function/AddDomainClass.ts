import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../../functions/FileFunctions";

/**
 * AddDomainClass editor
 * - Adds maven dependencies
 * - Adds domain class
 */
@Editor("AddDomainClass", "adds domain class")
@Tags("rug", "domain", "DTO", "shboland")
export class AddDomainClass implements EditProject {
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
    public module: string = "domain";

    @Parameter({
        displayName: "Version",
        description: "Version of jackson",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public version: string = "2.9.2";

    public edit(project: Project) {

        const basePath = this.module + "/src/main";
        const pathClass = basePath + "/java/" + fileFunctions.toPath(this.basePackage)
            + "/domain/Json" + this.className + ".java";

        this.addDependencies(project);
        this.addDomainClass(project, pathClass);
    }

    private addDependencies(project: Project): void {
        // Master pom
        const jacksonDependency = `            <dependency>
                <groupId>com.fasterxml.jackson.core</groupId>
                <artifactId>jackson-annotations</artifactId>
                <version>\${jackson.version}</version>
            </dependency>`;

        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependencyManagementDependency(
                "com.fasterxml.jackson.core",
                "jackson-annotations",
                jacksonDependency,
            );
            pom.addOrReplaceProperty("jackson.version", this.version);
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-hateoas");
        });

        // Module pom
        const targetFilePath = this.module + "/pom.xml";
        const modulePomFile: File = fileFunctions.findFile(project, targetFilePath);

        eng.with<Pom>(modulePomFile, "/Pom()", pom => {
            pom.addOrReplaceDependency("com.fasterxml.jackson.core", "jackson-annotations");
        });
    }

    private addDomainClass(project: Project, pathClass: string): void {

        const domainPackage = "domain";
        const rawJavaFileContent = `package ${this.basePackage + "." + domainPackage};

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.hateoas.ResourceSupport;

@JsonInclude(value = JsonInclude.Include.NON_NULL)
public class Json${this.className} extends ResourceSupport {

    // @Input
    
}`;

        if (!project.fileExists(pathClass)) {
            project.addFile(pathClass, rawJavaFileContent);
        }
    }
}

export const addDomainClass = new AddDomainClass();
