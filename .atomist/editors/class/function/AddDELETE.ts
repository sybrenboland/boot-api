import { File } from "@atomist/rug/model/File";
import { Pom } from "@atomist/rug/model/Pom";
import { Project } from "@atomist/rug/model/Project";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";
import { PathExpressionEngine } from "@atomist/rug/tree/PathExpression";
import { javaFunctions } from "../../functions/JavaClassFunctions";
import { fileFunctions } from "../../functions/FileFunctions";
import { unitTestFunctions } from "../../functions/UnitTestFunctions";

/**
 * AddDELETE editor
 * - Adds maven dependencies
 * - Adds method to resource class and interface
 * - Adds method to service
 * - Adds method to converter
 * - Adds unit tests
 * - Adds integration tests
 *
 * Requires:
 * - Bean class
 * - Domain class
 * - Resource class and interface
 * - Service class
 * - Repository
 */
@Editor("AddDELETE", "adds REST put method")
@Tags("rug", "api", "AddDELETE", "shboland")
export class AddDELETE implements EditProject {
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
        required: false,
    })
    public basePackage: string = "org.shboland";

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

        const basePathApi = this.apiModule + "/src/main/java/" + fileFunctions.toPath(this.basePackage) + "/api";
        const basePathCore = this.coreModule + "/src/main/java/" + fileFunctions.toPath(this.basePackage) + "/core";

        this.addDependencies(project);
        this.addResourceInterfaceMethod(project, basePathApi);
        this.addResourceClassMethod(project, basePathApi);
        this.addResourceClassMethodUnitTest(project);
        this.addServiceMethod(project, basePathCore);
        this.addServiceMethodUnitTest(project);
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
    @RequestMapping(value = "/{${this.className.toLowerCase()}Id}", method = RequestMethod.DELETE)
    ResponseEntity delete${this.className}(@PathVariable("${this.className.toLowerCase()}Id") ` +
            `long ${this.className.toLowerCase()}Id);`;

        const path = basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }

    private addResourceClassMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    @Override
    public ResponseEntity delete${this.className}(@PathVariable long ${this.className.toLowerCase()}Id) {

        return ${this.className.toLowerCase()}Service.delete${this.className}(${this.className.toLowerCase()}Id) ?
                ResponseEntity.ok().build() :
                ResponseEntity.notFound().build();
    }`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }


    private addResourceClassMethodUnitTest(project: Project) {

        const rawJavaMethod = `
    
    @Test
    public void testDelete${this.className}() {

        when(${this.className.toLowerCase()}Service.delete${this.className}(${this.className.toUpperCase()}_ID)).thenReturn(true);

        ResponseEntity response = ${this.className.toLowerCase()}Controller.delete${this.className}(${this.className.toUpperCase()}_ID);

        assertNotNull("No object returned.", response);
        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatusCodeValue());
    }

    @Test
    public void testDelete${this.className}_No${this.className}Found() {

        when(${this.className.toLowerCase()}Service.delete${this.className}(${this.className.toUpperCase()}_ID)).thenReturn(false);

        ResponseEntity response = ${this.className.toLowerCase()}Controller.delete${this.className}(${this.className.toUpperCase()}_ID);

        assertNotNull("No object returned.", response);
        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatusCodeValue());
    }`;

        const pathControllerUnitTest = this.apiModule + "/src/test/java/" + fileFunctions.toPath(this.basePackage) + "/api/resource/" + this.className + "ControllerTest.java";
        if (!project.fileExists(pathControllerUnitTest)) {
            unitTestFunctions.basicUnitTestController(project, pathControllerUnitTest, this.className, this.basePackage);
        }

        const file: File = project.findFile(pathControllerUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.className + 'Service');
        unitTestFunctions.addLongParameter(file, `${this.className.toUpperCase()}_ID`);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${this.basePackage}.core.service.${this.className}Service`);
        javaFunctions.addImport(file, 'org.springframework.http.HttpStatus');
        javaFunctions.addImport(file, 'org.springframework.http.ResponseEntity');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }


    private addServiceMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    public boolean delete${this.className}(long ${this.className.toLowerCase()}Id) {
        Optional<${this.className}> ${this.className.toLowerCase()} = ${this.className.toLowerCase()}Repository.` +
            `findById(${this.className.toLowerCase()}Id);

        if (${this.className.toLowerCase()}.isPresent()) {
            ${this.className.toLowerCase()}Repository.delete(${this.className.toLowerCase()}.get());
            return true;
        } else {
            return false;
        }
    }`;

        const path = basePath + "/service/" + this.className + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".persistence.db.hibernate.bean." + this.className);
        javaFunctions.addImport(file, "java.util.Optional");
    }


    private addServiceMethodUnitTest(project: Project) {

        const rawJavaMethod = `
    
    @Test
    public void testDelete${this.className}() {

        when(${this.className.toLowerCase()}Repository.findById(${this.className.toUpperCase()}_ID)).thenReturn(Optional.of(${this.className.toLowerCase()}));

        boolean resultDelete = ${this.className.toLowerCase()}Service.delete${this.className}(${this.className.toUpperCase()}_ID);

        assertTrue("Wrong result returned!", resultDelete);
        verify(${this.className.toLowerCase()}Repository, times(1)).delete(${this.className.toLowerCase()});
    }

    @Test
    public void testDelete${this.className}_No${this.className}Found() {

        when(${this.className.toLowerCase()}Repository.findById(${this.className.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean resultDelete = ${this.className.toLowerCase()}Service.delete${this.className}(${this.className.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", resultDelete);
        verify(${this.className.toLowerCase()}Repository, never()).delete(${this.className.toLowerCase()});
    }`;

        const pathServiceUnitTest = this.coreModule + "/src/test/java/" + fileFunctions.toPath(this.basePackage) + "/core/service/" + this.className + "ServiceTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestService(project, pathServiceUnitTest, this.className, this.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.className + 'Repository');
        unitTestFunctions.addLongParameter(file, `${this.className.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.className);

        javaFunctions.addImport(file, `${this.basePackage}.persistence.db.repo.${this.className}Repository`);
        javaFunctions.addImport(file, `${this.basePackage}.persistence.db.hibernate.bean.${this.className}`);
        javaFunctions.addImport(file, 'java.util.Optional');

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, 'static org.junit.Assert.assertFalse');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.never');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.times');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.verify');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }

    private addIntegrationTests(project: Project) {
        const rawJavaMethod = `
    @Test
    public void testDelete${this.className}_unknownObject() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.delete("/${this.className.toLowerCase()}s/-1"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }

    @Test
    public void testDelete${this.className}_deleteObject() throws Exception {
    
        ${this.className} saved${this.className} = IntegrationTestFactory.givenA${this.className}(${this.className.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.delete("/${this.className.toLowerCase()}s/" + saved${this.className}.getId()))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
        assertFalse("Entity not deleted", ${this.className.toLowerCase()}Repository.findById(saved${this.className}.getId()).isPresent());
    }`;

        const path = this.apiModule + "/src/test/java/integration/" + this.className + "ResourceIT.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "testDelete" + this.className + "_unknownObject", rawJavaMethod);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, "org.springframework.http.HttpStatus");
        javaFunctions.addImport(file, "org.springframework.mock.web.MockHttpServletResponse");
        javaFunctions.addImport(file, "static org.junit.Assert.assertFalse");
        javaFunctions.addImport(file, "static org.junit.Assert.assertTrue");
        javaFunctions.addImport(file, "static org.junit.Assert.assertEquals");
        javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
        javaFunctions.addImport(file, this.basePackage + ".persistence.db.hibernate.bean." + this.className);
    }
}

export const addDelete = new AddDELETE();
