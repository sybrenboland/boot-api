import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";

/**
 * AddRepository editor
 * - Adds maven dependencies
 * - Adds repository
 */
@Editor("AddRepository", "adds repository")
@Tags("rug", "api", "shell", "shboland")
export class AddRepository implements EditProject {
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
    public module: string = "persistence";

    public edit(project: Project) {

        const basePath = this.module + "/src/main/java/" + this.basePackage.replace(/\./gi, "/");

        this.addDependencies(project);
        this.addRepositoryClass(project, basePath);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-data-jpa");
        });
    }

    private addRepositoryClass(project: Project, basePath: string): void {

        const rawJavaFileContent = `package ${this.basePackage}.db.repo;

import ${this.basePackage}.db.hibernate.bean.${this.className};
import org.springframework.data.jpa.repository.JpaRepository;

public interface ${this.className}Repository extends JpaRepository<${this.className}, Long> {
}`;

        const pathRepository = basePath + "/db/repo/" + this.className + "Repository.java";
        if (!project.fileExists(pathRepository)) {
            project.addFile(pathRepository, rawJavaFileContent);
        }
    }
}

export const addRepository = new AddRepository();
