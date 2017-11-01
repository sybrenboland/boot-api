import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../functions/FileFunctions";

/**
 * AddLiquibase editor
 * - Adds maven dependencies
 */
@Editor("AddLiquibase", "adds REST get method")
@Tags("rug", "api", "GET", "shboland")
export class AddLiquibase implements EditProject {
    @Parameter({
        displayName: "Module name",
        description: "Name of the module we want to add",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "api";

    @Parameter({
        displayName: "Module name",
        description: "Name of the module we want to add",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public persistenceModule: string = "persistence";

    @Parameter({
        displayName: "Version",
        description: "Version of liquibase",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public liquibaseVersion: string = "3.5.3";

    @Parameter({
        displayName: "Version",
        description: "Version of postgres driver",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public postgresVersion: string = "9.1-901.jdbc4";

    public edit(project: Project) {
        this.addDependencies(project);
        this.addApplicationYaml(project);
        this.addMasterChangeLog(project);
        this.addDatabaseDockerComposeYaml(project);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        // Master pom
        const liquibaseDependency = `            <dependency>
                <groupId>org.liquibase</groupId>
                <artifactId>liquibase-core</artifactId>
                <version>\${liquibase.version}</version>
                <scope>runtime</scope>
            </dependency>`;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependencyManagementDependency("org.liquibase", "liquibase-core", liquibaseDependency);
            pom.addOrReplaceProperty("liquibase.version", this.liquibaseVersion);
        });

        const postgresDependency = `            <dependency>
                <groupId>postgresql</groupId>
                <artifactId>postgresql</artifactId>
                <version>\${postgres.version}</version>
                <scope>runtime</scope>
            </dependency>`;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependencyManagementDependency("postgresql", "postgresql", postgresDependency);
            pom.addOrReplaceProperty("postgres.version", this.postgresVersion);
        });

        // Module pom
        const targetFilePath = this.apiModule + "/pom.xml";
        const apiModulePomFile: File = fileFunctions.findFile(project, targetFilePath);

        eng.with<Pom>(apiModulePomFile, "/Pom()", pom => {
            pom.addOrReplaceDependencyOfScope("org.liquibase", "liquibase-core", "runtime");
            pom.addOrReplaceDependencyOfScope("postgresql", "postgresql", "runtime");
        });
    }

    private addApplicationYaml(project: Project): void {

        const resourceApplicationYamlPath = this.apiModule + "/src/main/resources/application.yml";
        const rawApplicationYaml = `spring.profiles.active: development
---
spring:
  profiles: development
  datasource:
    url: jdbc:postgresql://localhost:5482/postgres
    username: pgroot
    password: pgpass
liquibase:
  change-log: classpath:/liquibase/db-changelog.xml
`;

        if (!project.fileExists(resourceApplicationYamlPath)) {
            project.addFile(resourceApplicationYamlPath, rawApplicationYaml);
        }
    }

    private addMasterChangeLog(project: Project): void {

        const masterChangeLogPath = this.persistenceModule + "/src/main/resources/liquibase/db-changelog.xml";
        const rawMasterChangeLog = `<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.4.xsd">

  <includeAll path="release/" relativeToChangelogFile="true"/>
</databaseChangeLog>
`;

        if (!project.fileExists(masterChangeLogPath)) {
            project.addFile(masterChangeLogPath, rawMasterChangeLog);
        }
    }

    private addDatabaseDockerComposeYaml(project: Project): void {

        const pathDockerComposeYaml = "docker-compose.yml";
        const rawDockerComposeYaml = `postgres:
  image: postgres:9.6.3
  ports:
    - 5482:5432
  environment:
    POSTGRES_USER: pgroot
    POSTGRES_PASSWORD: pgpass
`;

        if (!project.fileExists(pathDockerComposeYaml)) {
            project.addFile(pathDockerComposeYaml, rawDockerComposeYaml);
        }
    }
}

export const addLiquibase = new AddLiquibase();
