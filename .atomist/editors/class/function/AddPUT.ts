import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import { addServiceMethodFetchBean, addServiceMethodFetchBeanUnitTest } from "./AddGET";
import {javaFunctions} from "../../functions/JavaClassFunctions";
import { addServiceMethodSaveBean, addServiceMethodSaveBeanUnitTest } from "./AddPOST";
import { fileFunctions } from "../../functions/FileFunctions";
import { unitTestFunctions } from "../../functions/UnitTestFunctions";

/**
 * AddPUT editor
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
@Editor("AddPUT", "adds REST put method")
@Tags("rug", "api", "AddPUT", "shboland")
export class AddPUT implements EditProject {
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
        addServiceMethodFetchBean(project, this.className, this.basePackage, basePathCore);
        addServiceMethodFetchBeanUnitTest(project, this.className, this.basePackage, this.coreModule);
        addServiceMethodSaveBean(project, this.className, this.basePackage, basePathCore);
        addServiceMethodSaveBeanUnitTest(project, this.className, this.basePackage, this.coreModule);
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
    @RequestMapping(value = "/{${this.className.toLowerCase()}Id}", method = RequestMethod.PUT)
    ResponseEntity put${this.className}(` +
            `@PathVariable("${this.className.toLowerCase()}Id") long ${this.className.toLowerCase()}Id, ` +
            `@RequestBody Json${this.className} json${this.className});`;

        const path = basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestBody");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
    }

    private addResourceClassMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `
    @Override
    public ResponseEntity<Json${this.className}> put${this.className}` +
            `(@PathVariable long ${this.className.toLowerCase()}Id, ` +
            `@RequestBody Json${this.className} json${this.className}) {

        Optional<${this.className}> ${this.className.toLowerCase()}Optional = ${this.className.toLowerCase()}Service` +
            `.fetch${this.className}(${this.className.toLowerCase()}Id);

        ${this.className} saved${this.className};
        if (!${this.className.toLowerCase()}Optional.isPresent()) {
            saved${this.className} = ${this.className.toLowerCase()}Service` +
            `.save(${this.className.toLowerCase()}Converter.fromJson(json${this.className}));
        } else {
            saved${this.className} = ${this.className.toLowerCase()}Service` +
            `.save(${this.className.toLowerCase()}Converter.fromJson(json${this.className}, ${this.className.toLowerCase()}Id));
        }

        return ResponseEntity.ok(${this.className.toLowerCase()}Converter.toJson(saved${this.className}));
    }`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.className, rawJavaMethod);

        javaFunctions.addImport(file, "java.util.Optional");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestBody");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
    }

    private addResourceClassMethodUnitTest(project: Project) {

        const rawJavaMethod = `
    
    @Test
    public void testPut${this.className}_CreateNew${this.className}() {

        when(${this.className.toLowerCase()}Service.fetch${this.className}(${this.className.toUpperCase()}_ID)).thenReturn(Optional.empty());
        when(${this.className.toLowerCase()}Service.save(any())).thenReturn(${this.className.toLowerCase()});

        ResponseEntity response = ${this.className.toLowerCase()}Controller.put${this.className}(${this.className.toUpperCase()}_ID, json${this.className});

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
        verify(${this.className.toLowerCase()}Converter, times(1)).fromJson(json${this.className});
        verify(${this.className.toLowerCase()}Converter, never()).fromJson(json${this.className}, ${this.className.toUpperCase()}_ID);
        verify(${this.className.toLowerCase()}Converter, times(1)).toJson(any());
    }

    @Test
    public void testPut${this.className}_Update${this.className}() {

        when(${this.className.toLowerCase()}Service.fetch${this.className}(${this.className.toUpperCase()}_ID)).thenReturn(Optional.of(${this.className.toLowerCase()}));
        when(${this.className.toLowerCase()}Service.save(any())).thenReturn(${this.className.toLowerCase()});

        ResponseEntity response = ${this.className.toLowerCase()}Controller.put${this.className}(${this.className.toUpperCase()}_ID, json${this.className});

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
        verify(${this.className.toLowerCase()}Converter, never()).fromJson(json${this.className});
        verify(${this.className.toLowerCase()}Converter, times(1)).fromJson(json${this.className}, ${this.className.toUpperCase()}_ID);
        verify(${this.className.toLowerCase()}Converter, times(1)).toJson(any());
    }`;

        const pathControllerUnitTest = this.apiModule + "/src/test/java/" + fileFunctions.toPath(this.basePackage) + "/api/resource/" + this.className + "ControllerTest.java";
        if (!project.fileExists(pathControllerUnitTest)) {
            unitTestFunctions.basicUnitTestController(project, pathControllerUnitTest, this.className, this.basePackage);
        }

        const file: File = project.findFile(pathControllerUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.className + 'Service');
        unitTestFunctions.addMock(file, this.className + 'Converter');
        unitTestFunctions.addLongParameter(file, `${this.className.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.className);
        unitTestFunctions.addBeanParameter(file, 'Json' + this.className);

        javaFunctions.addImport(file, 'java.util.Optional');
        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${this.basePackage}.persistence.db.hibernate.bean.${this.className}`);
        javaFunctions.addImport(file, `${this.basePackage}.domain.entities.Json${this.className}`);
        javaFunctions.addImport(file, `${this.basePackage}.core.service.${this.className}Service`);
        javaFunctions.addImport(file, `${this.basePackage}.api.convert.${this.className}Converter`);
        javaFunctions.addImport(file, 'org.springframework.http.HttpStatus');
        javaFunctions.addImport(file, 'org.springframework.http.ResponseEntity');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.any');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.verify');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.never');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.times');
    }

    private addIntegrationTests(project: Project) {
        const rawJavaMethod = `
    @Test
    public void testPut${this.className}_invalidObject() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.put("/${this.className.toLowerCase()}s/-1", new Object()))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }

    @Test
    public void testPut${this.className}_newObject() throws Exception {
    
        Json${this.className} ${this.className.toLowerCase()} = IntegrationTestFactory.givenAJson${this.className}();

        MockHttpServletResponse response =
                mockMvc.perform(IntegrationTestUtils.doPut("/${this.className.toLowerCase()}s/-1", ${this.className.toLowerCase()}))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity link returned.", response.getContentAsString().contains("/${this.className.toLowerCase()}s/"));
        // @FieldInputAssert
    }

    @Test
    public void testPut${this.className}_updateObject() throws Exception {
    
        ${this.className} saved${this.className} = IntegrationTestFactory.givenA${this.className}(${this.className.toLowerCase()}Repository);

        Json${this.className} ${this.className.toLowerCase()} = IntegrationTestFactory.givenAJson${this.className}();

        MockHttpServletResponse response =
                mockMvc.perform(IntegrationTestUtils.doPut("/${this.className.toLowerCase()}s/" + saved${this.className}.getId(), ${this.className.toLowerCase()}))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity link returned.", response.getContentAsString().contains("/${this.className.toLowerCase()}s/"));
        // @FieldInputAssert
    }`;

        const path = this.apiModule + "/src/test/java/integration/" + this.className + "ResourceIT.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "testPut" + this.className + "_invalidObject", rawJavaMethod);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, "org.springframework.http.HttpStatus");
        javaFunctions.addImport(file, "org.springframework.mock.web.MockHttpServletResponse");
        javaFunctions.addImport(file, "static org.junit.Assert.assertEquals");
        javaFunctions.addImport(file, "static org.junit.Assert.assertTrue");
        javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
        javaFunctions.addImport(file, this.basePackage + ".persistence.db.hibernate.bean." + this.className);
    }
}

export const addPut = new AddPUT();
