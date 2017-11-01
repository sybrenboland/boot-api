import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../functions/FileFunctions";

/**
 * AddConfig editor
 * - Adds maven dependencies
 * - Adds Persistence configuration file
 * - Adds Domain configuration file
 * - Adds Api configuration file
 * - Add bootstrap.yml
 */
@Editor("AddConfig", "adds additional config properties")
@Tags("rug", "api", "config", "shboland")
export class AddConfig implements EditProject {
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
        displayName: "Persistence module name",
        description: "Name of the persistence module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public persistenceModule: string = "persistence";

    @Parameter({
        displayName: "Domain module name",
        description: "Name of the domain module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public domainModule: string = "domain";

    public edit(project: Project) {
        this.addDependencies(project);
        this.addPersistenceConfig(project);
        this.addDomainConfig(project);
        this.addApiConfig(project);
        this.addBootstrapYaml(project);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.cloud", "spring-cloud-starter-config");
        });
    }

    private addPersistenceConfig(project: Project) {
        const configPath = this.persistenceModule + "/src/main/java/"
            + fileFunctions.toPath(this.basePackage) + "/configuration/PersistenceConfiguration.java";
        const rawJavaFileContent = `package ${this.basePackage}.configuration;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = { "${this.basePackage}.db" })
public class PersistenceConfiguration {
}
`;
        if (!project.fileExists(configPath)) {
            project.addFile(configPath, rawJavaFileContent);
        }
    }

    private addDomainConfig(project: Project) {
        const configPath = this.domainModule + "/src/main/java/"
            + fileFunctions.toPath(this.basePackage) + "/configuration/DomainConfiguration.java";
        const rawJavaFileContent = `package ${this.basePackage}.configuration;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = { "${this.basePackage}.domain" })
public class DomainConfiguration {
}
`;
        if (!project.fileExists(configPath)) {
            project.addFile(configPath, rawJavaFileContent);
        }
    }

    private addApiConfig(project: Project) {
        const configPath = this.apiModule + "/src/main/java/"
            + fileFunctions.toPath(this.basePackage) + "/configuration/ApiConfiguration.java";
        const rawJavaFileContent = `package ${this.basePackage}.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import({PersistenceConfiguration.class, DomainConfiguration.class})
public class ApiConfiguration {
}
`;
        if (!project.fileExists(configPath)) {
            project.addFile(configPath, rawJavaFileContent);
        }
    }

    private addBootstrapYaml(project: Project): void {

        const resourceBootstrapYamlPath = this.apiModule + "/src/main/resources/bootstrap.yml";
        const rawBootstrapYaml = `spring.profiles.active: development
---
spring:
  profiles: development
  application:
    name: spring-boot-api
server:
  port: 8888
  contextPath: /api
`;

        if (!project.fileExists(resourceBootstrapYamlPath)) {
            project.addFile(resourceBootstrapYamlPath, rawBootstrapYaml);
        }
    }
}

export const addConfig = new AddConfig();
