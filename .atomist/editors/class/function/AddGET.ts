import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {javaFunctions} from "../../functions/JavaClassFunctions";

/**
 * AddGET editor
 * - Adds maven dependencies
 * - Adds method to resource class and interface
 * - Adds method to service
 * - Adds method to converter
 *
 * Requires:
 * - Bean class
 * - Domain class
 * - Resource class and interface
 * - Service class
 * - Repository
 */
@Editor("AddGET", "adds REST get method")
@Tags("rug", "api", "GET", "shboland")
export class AddGET implements EditProject {
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
        addServiceMethodFetchBean(project, this.className, this.basePackage, basePathCore);

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
    @RequestMapping(path = "/{${this.className.toLowerCase()}Id}", method = RequestMethod.GET)
    ResponseEntity<Json${this.className}> get${this.className}(@PathVariable long ${this.className.toLowerCase()}Id);`;

        const path = basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
    }

    private addResourceClassMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    @Override
    public ResponseEntity<Json${this.className}> get${this.className}` +
            `(@PathVariable long ${this.className.toLowerCase()}Id) {
        Optional<${this.className}> ${this.className.toLowerCase()}Optional = ` +
            `${this.className.toLowerCase()}Service.fetch${this.className}(${this.className.toLowerCase()}Id);

        return ${this.className.toLowerCase()}Optional.isPresent() ?
                ResponseEntity.ok(${this.className.toLowerCase()}Converter` +
            `.toJson(${this.className.toLowerCase()}Optional.get())) :
                ResponseEntity.notFound().build();
    }`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "java.util.Optional");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
        javaFunctions.addImport(file, this.basePackage + ".persistence.db.hibernate.bean." + this.className);
    }

    private addIntegrationTests(project: Project) {
        const rawJavaMethod = `
    @Test
    public void testGet${this.className}_with${this.className}() throws Exception {

        ${this.className} ${this.className.toLowerCase()} = IntegrationTestFactory.givenA${this.className}(${this.className.toLowerCase()}Repository);
        cleanUpList${this.className}.add(${this.className.toLowerCase()}.getId());

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.className.toLowerCase()}s/" + ${this.className.toLowerCase()}.getId()))
                        .andReturn().getResponse();
                        
        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity link returned.", response.getContentAsString().contains("/${this.className.toLowerCase()}s/" + ${this.className.toLowerCase()}.getId()));
        // @FieldInputAssert
    }

    @Test
    public void testGet${this.className}_without${this.className}() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.className.toLowerCase()}s/-1"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }`;

        const path = this.apiModule + "/src/test/java/integration/" + this.className + "ResourceIT.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "testGet" + this.className + "_with" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, "org.springframework.http.HttpStatus");
        javaFunctions.addImport(file, "org.springframework.mock.web.MockHttpServletResponse");
        javaFunctions.addImport(file, "static org.junit.Assert.assertEquals");
        javaFunctions.addImport(file, "static org.junit.Assert.assertTrue");
        javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
    }
}

export function addServiceMethodFetchBean(project: Project, className: string, basePackage: string, basePath: string) {

    const rawJavaMethod = `
    public Optional<${className}> fetch${className}(long ${className.toLowerCase()}Id) {
        return ${className.toLowerCase()}Repository.findById(${className.toLowerCase()}Id);
    }`;

    const path = basePath + "/service/" + className + "Service.java";
    const file: File = project.findFile(path);
    javaFunctions.addFunction(file, "fetch" + className, rawJavaMethod);

    javaFunctions.addImport(file, "java.util.Optional");
    javaFunctions.addImport(file, basePackage + ".persistence.db.hibernate.bean." + className);
}

export const addGet = new AddGET();
