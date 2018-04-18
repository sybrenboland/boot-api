import {Pom} from "@atomist/rug/model/Pom";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../functions/FileFunctions";
import {javaFunctions} from "../functions/JavaClassFunctions";

/**
 * PackageAsWar editor
 * - Unable embedded tomcat server in root pom
 * - Set packaging to war in api module
 * - Adds a servlet initializer
 */
@Editor("PackageAsWar", "builds a war file")
@Tags("rug", "spring", "war", "package", "shboland")
export class PackageAsWar implements EditProject {
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

    public edit(project: Project) {

        const basePath = this.apiModule + "/src/main/java/" + this.basePackage.replace(/\./gi, "/");

        this.unableEmbeddedTomcat(project);
        this.setPackagingToWar(project);
        this.addServletInitializer(project, basePath);

        this.addDocumentation(project);
    }

    private unableEmbeddedTomcat(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependencyOfScope("org.springframework.boot", "spring-boot-starter-tomcat", "provided");
        });
    }

    private setPackagingToWar(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        const targetFilePath = this.apiModule + "/pom.xml";
        const modulePomFile: File = fileFunctions.findFile(project, targetFilePath);

        eng.with<Pom>(modulePomFile, "/Pom()", pom => {
            pom.setPackaging("war");
        });
    }


    private addServletInitializer(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(Application.class);
    }`;

        const path = basePath + "/api/Application.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, " configure", rawJavaMethod);

        javaFunctions.extendClass(file, "Application", "SpringBootServletInitializer");

        javaFunctions.addImport(file, "org.springframework.boot.builder.SpringApplicationBuilder");
        javaFunctions.addImport(file, "org.springframework.boot.web.support.SpringBootServletInitializer");
    }

    private addDocumentation(project: Project) {

        const rawInput = `
# Package as war
Now we chose to package our app as a war file the configuration in application.yml and bootstrap.yml is ignored. 
Instead the configuration is now set on the server on which we will deploy. 

Example with wildfly:
- Datasource config: application.yml -> <wildfly home>/standalone/standalone.xml
- url config: bootstrap.yml -> ${this.apiModule}/src/main/java/webapp/WEB-INF/jboss-web.xml
- (Don't forget to add module for the driver)
`;

        const file: File = project.findFile("README.md");
        file.append(rawInput);
    }
}

export const packageAsWar = new PackageAsWar();
