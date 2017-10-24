import { Project } from "@atomist/rug/model/Project";
import { Pom } from "@atomist/rug/model/Pom";
import { Generator, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { PopulateProject } from "@atomist/rug/operations/ProjectGenerator";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import {
    cleanChangeLog, cleanReadMe, movePackage, removeUnnecessaryFiles, renameClass,
    updatePom
} from "./RugGeneratorFunctions";
import { PathExpressionEngine } from "@atomist/rug/tree/PathExpression";

/**
 * Sample TypeScript generator used by AddNewMavenProject.
 */
@Generator("NewMavenProject", "Bare minimum of a maven project. (Use the editors!)")
@Tags("documentation")
export class NewMavenProject implements PopulateProject {

    @Parameter({
        displayName: "Maven Artifact ID",
        description: "Maven artifact identifier, i.e., the name of the jar without the version," +
        " it is often the same as the project name",
        pattern: "^[a-z][-a-z0-9_]*$", // Ideally this should be looking up artifactId as a common pattern
        validInput: "a valid Maven artifact ID, which starts with a lower-case letter and contains only " +
        " alphanumeric, -, and _ characters",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public artifactId: string = "spring-boot-api";

    @Parameter({
        displayName: "Maven Group ID",
        description: "Maven group identifier, often used to provide a namespace for your project, e.g., com.pany.team",
        pattern: Pattern.group_id,
        validInput: "a valid Maven group ID, which starts with a letter, -, or _ and contains only alphanumeric," +
        " -, and _ characters and may having leading period separated identifiers starting with letters or " +
        " underscores and containing only alphanumeric and _ characters.",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public groupId: string = "shboland";

    @Parameter({
        displayName: "Version",
        description: "initial version of the project, e.g., 1.2.3-SNAPSHOT",
        pattern: Pattern.semantic_version,
        validInput: "a valid semantic version, http://semver.org",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public version: string = "1.0.0";

    @Parameter({
        displayName: "Project Description",
        description: "short descriptive text describing the new project",
        pattern: Pattern.any,
        validInput: "free text sentence fragment",
        minLength: 1,
        maxLength: 100,
        required: false,
    })
    public description: string = "Spring Boot api project";

    @Parameter({
        displayName: "Root Package",
        description: "root package for your generated source, often this will be namespaced under the group ID",
        pattern: Pattern.java_package,
        validInput: "a valid Java package name, which consists of period-separated identifiers which" +
        " have only alphanumeric characters, $ and _ and do not start with a number",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public rootPackage: string = "org.shboland";

    @Parameter({
        displayName: "API module name",
        description: "Name of the module for the API",
        pattern: Pattern.any,
        validInput: "Just a name",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public apiModuleName: string = "api";

    @Parameter({
        displayName: "Persistence module name",
        description: "Name of the module for the persistence classes",
        pattern: Pattern.any,
        validInput: "Just a name",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public persistenceModuleName: string = "persistence";

    @Parameter({
        displayName: "Domain module name",
        description: "Name of the module for the domain classes",
        pattern: Pattern.any,
        validInput: "Just a name",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public domainModuleName: string = "domain";

    public populate(project: Project) {
        //cleanReadMe(project, this.description, this.groupId);
        //cleanChangeLog(project, this.groupId);
        //removeUnnecessaryFiles(project);
        //this.updatePom(project, this.artifactId, this.groupId, this.version, this.description);
        //movePackage(project, "com.atomist.springrest", this.rootPackage);
        //renameClass(project, "SpringRest", this.serviceClassName);
    }

    private updatePom(
        project: Project,
        artifactId: string,
        groupId: string,
        version: string,
        description: string): void {

        const eng: PathExpressionEngine = project.context.pathExpressionEngine;
        eng.with<Pom>(project, "/Pom()", pom => {
            pom.setArtifactId(artifactId);
            pom.setGroupId(groupId);
            pom.setProjectName(project.name);
            pom.setVersion(version);
            pom.setDescription(description);
        });
    }
}

export const newMavenProject = new NewMavenProject();
