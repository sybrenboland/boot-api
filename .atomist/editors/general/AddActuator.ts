import {Pom} from "@atomist/rug/model/Pom";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";

/**
 * AddActuator editor
 * - Adds maven dependency
 * - Extend bootstrap configuration
 */
@Editor("AddActuator", "adds actuator endpoints")
@Tags("rug", "spring", "actuator", "shboland")
export class AddActuator implements EditProject {

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
        displayName: "Management Port",
        description: "Port on which management endpoints are published",
        pattern: Pattern.any,
        validInput: "Number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public managementPort: string = "9001";

    public edit(project: Project) {

        this.addMavenDependency(project);
        this.extendConfiguration(project);
    }

    private addMavenDependency(project: Project) {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-actuator");
        });
    }

    private extendConfiguration(project: Project) {
        const rawConfiguration = `management:
  port: ${this.managementPort}
  security:
    enabled: false`;

        const path = this.apiModule + "/src/main/resources/bootstrap.yml";
        const file: File = project.findFile(path);
        if (file !== null && !file.contains("management")) {
            file.append(rawConfiguration);
        }
    }
}

export const addActuator = new AddActuator();
