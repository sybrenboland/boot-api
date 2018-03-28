import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Generator, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {PopulateProject} from "@atomist/rug/operations/ProjectGenerator";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";

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
    public groupId: string = "org.shboland";

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

    @Parameter({
        displayName: "Database module name",
        description: "Name of the module for the database description",
        pattern: Pattern.any,
        validInput: "Just a name",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public databaseModuleName: string = "db";

    public populate(project: Project) {
        this.deleteUselessFiles(project);
        this.updateMasterPom(project);
        this.moveModule(project, "api-module", this.apiModuleName);
        this.moveModule(project, "persistence-module", this.persistenceModuleName);
        this.moveModule(project, "domain-module", this.domainModuleName);
        this.moveModule(project, "db-module", this.databaseModuleName);
        this.updateModulePomParent(project);
        this.addApiDependencies(project);
    }

    private deleteUselessFiles(project: Project) {
        project.deleteDirectory(".idea");
        project.deleteDirectory("boot-api.iml");
    }

    private updateMasterPom(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;
        eng.with<Pom>(project, "/Pom()", pom => {
            pom.setArtifactId(this.artifactId);
            pom.setGroupId(this.groupId);
            pom.setVersion(this.version);
        });
    }

    private moveModule(project: Project, oldModuleName: string, newModuleName: string): void {

        project.replaceInPath(oldModuleName, newModuleName);
        const pomFile: File = project.findFile(newModuleName + '/pom.xml');
        pomFile.replace(oldModuleName, newModuleName);

        const masterPomFile: File = project.findFile("pom.xml");
        masterPomFile.replace(oldModuleName, newModuleName);
    }

    private updateModulePomParent(project: Project) {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;
        eng.with<Pom>(project, "//Pom()", pom => {
            if (pom.parentGroupId() !== "org.springframework.boot") {
                pom.setParentArtifactId(this.artifactId);
                pom.setParentGroupId(this.groupId);
                pom.setParentVersion(this.version);
            }
        });
    }

    private addApiDependencies(project: Project) {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;
        eng.with<Pom>(project, "//Pom()", pom => {
            if (pom.artifactId() === this.apiModuleName) {
                pom.addOrReplaceDependencyOfVersion(this.groupId, this.persistenceModuleName, this.version);
                pom.addOrReplaceDependencyOfVersion(this.groupId, this.domainModuleName, this.version);
            }
        });
    }
}

export const newMavenProject = new NewMavenProject();
