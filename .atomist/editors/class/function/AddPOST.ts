import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {javaFunctions} from "../../functions/JavaClassFunctions";
import {addExceptionHandler} from "../../general/AddExceptionHandler";

/**
 * AddPOST editor
 * - Adds maven dependencies
 * - Adds method to resource class and interface
 * - Adds method to service
 * - Adds method to converter
 * - Adds exception hadler class
 *
 * Requires:
 * - Bean class
 * - Domain class
 * - Resource class and interface
 * - Service class
 * - Repository
 */
@Editor("AddPOST", "adds REST post method")
@Tags("rug", "api", "POST", "shboland")
export class AddPOST implements EditProject {
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

    public edit(project: Project) {

        const basePathApi = this.apiModule + "/src/main/java/" +
            this.basePackage.replace(/\./gi, "/") + "/api";

        const basePathCore = this.coreModule + "/src/main/java/" +
            this.basePackage.replace(/\./gi, "/") + "/core";

        this.addDependencies(project);
        this.addResourceInterfaceMethod(project, basePathApi);
        this.addResourceClassMethod(project, basePathApi);
        addServiceMethodSaveBean(project, this.className, this.basePackage, basePathCore);
        this.addExceptionHandler(project);
        this.addIntegrationTests(project);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-web");
        });
    }

    private addResourceInterfaceMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `    
    @RequestMapping(value = "", method = RequestMethod.POST)
    ResponseEntity post${this.className}(@RequestBody Json${this.className} ${this.className.toLowerCase()}) ` +
            `throws URISyntaxException;`;

        const path = basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "post" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestBody");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, "java.net.URISyntaxException");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
    }

    private addResourceClassMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    @Override
    public ResponseEntity post${this.className}(@RequestBody Json${this.className} json${this.className}) ` +
            `throws URISyntaxException {
            
        ${this.className} new${this.className} = ${this.className.toLowerCase()}Service` +
            `.save(${this.className.toLowerCase()}Converter.fromJson(json${this.className}));

        return ResponseEntity.created(new URI(${this.className.toLowerCase()}Converter` +
            `.toJson(new${this.className}).getLink("self").getHref())).build();
    }`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "post" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "java.net.URI");
        javaFunctions.addImport(file, "java.net.URISyntaxException");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestBody");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
    }

    private addExceptionHandler(project: Project) {
        addExceptionHandler.javaException = "URISyntaxException";
        addExceptionHandler.exceptionPackage = "java.net";
        addExceptionHandler.httpResponse = "CONFLICT";
        addExceptionHandler.responseMessage = "There seems to be a problem with application. Please try again.";
        addExceptionHandler.apiModule = this.apiModule;
        addExceptionHandler.basePackage = this.basePackage;

        addExceptionHandler.edit(project);
    }

    private addIntegrationTests(project: Project) {
        const rawJavaMethod = `
    @Test
    public void testPost${this.className}_invalidObject() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.post("/${this.className.toLowerCase()}s"))
                .andExpect(MockMvcResultMatchers.status().isBadRequest());
    }

    @Test
    public void testPost${this.className}_newObject() throws Exception {

        Json${this.className} json${this.className} = Json${this.className}.builder().build();

        mockMvc.perform(IntegrationTestUtils.doPost("/${this.className.toLowerCase()}s", json${this.className}))
                .andExpect(MockMvcResultMatchers.status().isCreated());
    }`;

        const path = this.apiModule + "/src/test/java/integration/" + this.className + "ResourceIT.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "testPost" + this.className + "_invalidObject", rawJavaMethod);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
        javaFunctions.addImport(file, "org.springframework.test.web.servlet.result.MockMvcResultMatchers");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
    }
}

export function addServiceMethodSaveBean(project: Project, className: string, basePackage: string, basePath: string) {

    const rawJavaMethod = `
    public ${className} save(${className} ${className.toLowerCase()}) {
        return ${className.toLowerCase()}Repository.save(${className.toLowerCase()});
    }`;

    const path = basePath + "/service/" + className + "Service.java";
    const file: File = project.findFile(path);
    javaFunctions.addFunction(file, "save", rawJavaMethod);

    javaFunctions.addImport(file, basePackage + ".persistence.db.hibernate.bean." + className);
}

export const addPost = new AddPOST();
