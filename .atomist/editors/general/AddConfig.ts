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
        required: false,
    })
    public basePackage: string = "org.shboland";

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
        displayName: "Core apiModule name",
        description: "Name of the apiModule with the business logic",
        pattern: Pattern.any,
        validInput: "Just a name",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public coreModule: string = "core";

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

    @Parameter({
        displayName: "Port number",
        description: "Port on which the service is exposed",
        pattern: Pattern.port,
        validInput: "Port",
        minLength: 0,
        maxLength: 4,
        required: false,
    })
    public port: string = "8888";

    public edit(project: Project) {
        this.addDependencies(project);
        this.addPersistenceConfig(project);
        this.addDomainConfig(project);
        this.addCoreConfig(project);
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
            + fileFunctions.toPath(this.basePackage) + "/persistence/configuration/PersistenceConfiguration.java";
        const rawJavaFileContent = `package ${this.basePackage}.persistence.configuration;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@ComponentScan(basePackages = { "${this.basePackage}.persistence.db" })
@EntityScan(basePackages = { "${this.basePackage}.persistence.db.hibernate.bean" })
@EnableJpaRepositories("${this.basePackage}.persistence.db.repo")
public class PersistenceConfiguration {
}
`;
        if (!project.fileExists(configPath)) {
            project.addFile(configPath, rawJavaFileContent);
        }
    }

    private addDomainConfig(project: Project) {
        const configPath = this.domainModule + "/src/main/java/"
            + fileFunctions.toPath(this.basePackage) + "/domain/configuration/DomainConfiguration.java";
        const rawJavaFileContent = `package ${this.basePackage}.domain.configuration;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan(basePackages = { "${this.basePackage}.domain.entities" })
public class DomainConfiguration {
}
`;
        if (!project.fileExists(configPath)) {
            project.addFile(configPath, rawJavaFileContent);
        }
    }

    private addCoreConfig(project: Project) {
        const configPath = this.coreModule + "/src/main/java/"
            + fileFunctions.toPath(this.basePackage) + "/core/configuration/CoreConfiguration.java";
        const rawJavaFileContent = `package ${this.basePackage}.core.configuration;

import ${this.basePackage}.persistence.configuration.PersistenceConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import({PersistenceConfiguration.class})
@ComponentScan(basePackages = { "${this.basePackage}.core.service" })
public class CoreConfiguration {
}
`;
        if (!project.fileExists(configPath)) {
            project.addFile(configPath, rawJavaFileContent);
        }
    }

    private addApiConfig(project: Project) {
        const configPath = this.apiModule + "/src/main/java/"
            + fileFunctions.toPath(this.basePackage) + "/api/configuration/ApiConfiguration.java";
        const rawJavaFileContent = `package ${this.basePackage}.api.configuration;

import ${this.basePackage}.core.configuration.CoreConfiguration;
import ${this.basePackage}.domain.configuration.DomainConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import({CoreConfiguration.class, DomainConfiguration.class})
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
  port: ${this.port}
  servlet:
    contextPath: /api
---
spring:
  profiles: production
  application:
    name: spring-boot-api
server:
  port: ${this.port}
  servlet:
    contextPath: /api
`;

        if (!project.fileExists(resourceBootstrapYamlPath)) {
            project.addFile(resourceBootstrapYamlPath, rawBootstrapYaml);
        }
    }
}

export const addConfig = new AddConfig();
