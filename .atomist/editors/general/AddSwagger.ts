import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../functions/FileFunctions";

/**
 * AddSwagger editor
 * - Adds maven dependencies
 * - Adds swagger config class
 */
@Editor("AddSwagger", "adds swagger ui")
@Tags("rug", "api", "swagger", "shboland")
export class AddSwagger implements EditProject {
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
    public apiModule: string = "api";

    @Parameter({
        displayName: "Version",
        description: "Version of swagger",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public version: string = "2.4.0";

    public edit(project: Project) {
        const basePath = this.apiModule + "/src/main";

        this.addDependencies(project);
        this.addSwaggerConfigFile(project, basePath);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        // Master pom
        const swagger2Dependency = `            <dependency>
                <groupId>io.springfox</groupId>
                <artifactId>springfox-swagger2</artifactId>
                <version>\${swagger.version}</version>
            </dependency>`;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependencyManagementDependency("io.springfox", "springfox-swagger2", swagger2Dependency);
            pom.addOrReplaceProperty("swagger.version", this.version);
        });

        const swaggerUiDependency = `            <dependency>
                <groupId>io.springfox</groupId>
                <artifactId>springfox-swagger-ui</artifactId>
                <version>\${swagger.version}</version>
            </dependency>`;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependencyManagementDependency("io.springfox", "springfox-swagger-ui", swaggerUiDependency);
            pom.addOrReplaceProperty("swagger.version", this.version);
        });

        // Module pom
        const targetFilePath = this.apiModule + "/pom.xml";
        const apiModulePomFile: File = fileFunctions.findFile(project, targetFilePath);

        eng.with<Pom>(apiModulePomFile, "/Pom()", pom => {
            pom.addOrReplaceDependency("io.springfox", "springfox-swagger2");
            pom.addOrReplaceDependency("io.springfox", "springfox-swagger-ui");
        });
    }

    private addSwaggerConfigFile(project: Project, basePath: string): void {

        const pathSwaggerConfig = basePath + "/java/" + this.basePackage.replace(/\./gi, "/")
            + "/api/configuration/SwaggerConfiguration.java";
        const rawSwaggerConfigFile = `package ${this.basePackage}.api.configuration;

import com.google.common.base.Predicates;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
public class SwaggerConfiguration {

	@Bean
	public Docket postsApi() {
		return new Docket(DocumentationType.SWAGGER_2)
				.groupName("API")
				.apiInfo(apiInfo())
				.select()
				.apis(Predicates.not(RequestHandlerSelectors.basePackage("org.springframework.boot")))
				.build();
	}

	private ApiInfo apiInfo() {
		return new ApiInfoBuilder()
				.title("API")
				.build();
	}

}`;

        if (!project.fileExists(pathSwaggerConfig)) {
            project.addFile(pathSwaggerConfig, rawSwaggerConfigFile);
        }
    }
}

export const addSwagger = new AddSwagger();
