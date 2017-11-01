import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";

/**
 * AddSpringBoot editor
 * - Sets spring boot version of maven parent
 * - Add spring boot application class
 */
@Editor("AddSpringBoot", "sets spring boot version")
@Tags("rug", "spring", "boot", "shboland")
export class AddSpringBoot implements EditProject {
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
        displayName: "Api module name",
        description: "Name of the api module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "api";

    @Parameter({
        displayName: "Version",
        description: "Version of Spring Boot",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public version: string = "1.5.8.RELEASE";

    public edit(project: Project) {
        this.setVersionBootParent(project);
        this.addApplicationFile(project);
    }

    private setVersionBootParent(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.setParentGroupId("org.springframework.boot");
            pom.setParentArtifactId("spring-boot-starter-parent");
            pom.setParentVersion(this.version);
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-web");
        });
    }

    private addApplicationFile(project: Project): void {
        const applicationPath = this.apiModule + "/src/main/java/"
            + this.basePackage.replace(/\./gi, "/") + "/Application.java";
        const rawJavaFileContent = `package ${this.basePackage};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`;

        if (!project.fileExists(applicationPath)) {
            project.addFile(applicationPath, rawJavaFileContent);
        }
    }
}

export const addSpringBoot = new AddSpringBoot();
