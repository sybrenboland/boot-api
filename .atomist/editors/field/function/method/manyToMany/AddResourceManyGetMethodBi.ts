import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";

export class AddResourceGetMethodManyBi extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addMethod(project, params);
        this.addUnitTests(project, params);
    }

    private addMethod(project: Project, params: Params) {

        const rawJavaMethod = `
    @Override
    public ResponseEntity get${this.oneClass}(@PathVariable long ${this.otherClass.toLowerCase()}Id) {
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ${javaFunctions.lowercaseFirst(this.oneClass)}Service` +
            `.fetch${this.oneClass}For${this.otherClass}(${this.otherClass.toLowerCase()}Id);

        return ${this.oneClass.toLowerCase()}Optional.isPresent() ? 
                 ResponseEntity.ok(${javaFunctions.lowercaseFirst(this.oneClass)}Converter.toJson(${this.oneClass.toLowerCase()}Optional.get())) : 
                 ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/api/resource/" + this.otherClass + "Controller.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "get" + this.oneClass + "s", rawJavaMethod);

            javaFunctions.addImport(file, "java.util.List");
            javaFunctions.addImport(file, "java.util.Optional");
            javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
            javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

            javaFunctions.addToConstructor(
                file,
                this.otherClass + "Controller",
                this.oneClass + "Service",
                javaFunctions.lowercaseFirst(this.oneClass) + "Service");
            javaFunctions.addImport(file, params.basePackage + ".core.service." + this.oneClass + "Service");

            javaFunctions.addToConstructor(
                file,
                this.otherClass + "Controller",
                this.oneClass + "Converter",
                javaFunctions.lowercaseFirst(this.oneClass) + "Converter");
            javaFunctions.addImport(file, params.basePackage + ".api.convert." + this.oneClass + "Converter");
        } else {
            console.error("Resource class not added yet!");
        }
    }

    private addUnitTests(project: Project, params: Params) {

        const rawJavaMethod = `
        
    @Test
    public void testGet${this.oneClass}_No${this.oneClass}Found() {

        when(${this.oneClass.toLocaleLowerCase()}Service.fetch${this.oneClass}For${this.otherClass}(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        ResponseEntity response = ${this.otherClass.toLocaleLowerCase()}Controller.get${this.oneClass}(${this.otherClass.toUpperCase()}_ID);

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.NOT_FOUND.value(), response.getStatusCodeValue());
    }

    @Test
    public void testGet${this.oneClass}_With${this.oneClass}() {

        when(${this.oneClass.toLocaleLowerCase()}Service.fetch${this.oneClass}For${this.otherClass}(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLocaleLowerCase()}));
        when(${this.oneClass.toLocaleLowerCase()}Converter.toJson(${this.oneClass.toLocaleLowerCase()})).thenReturn(json${this.oneClass});

        ResponseEntity response = ${this.otherClass.toLocaleLowerCase()}Controller.get${this.oneClass}(${this.otherClass.toUpperCase()}_ID);

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
        assertTrue("Returned object of wrong type!", response.getBody() instanceof Json${this.oneClass});
        assertEquals("Wrong object returned!", json${this.oneClass}, response.getBody());
    }`;

        const pathServiceUnitTest = params.apiModule + "/src/test/java/" + fileFunctions.toPath(params.basePackage) + "/api/resource/" + this.otherClass + "ControllerTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestController(project, pathServiceUnitTest, this.otherClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.oneClass + 'Service');
        unitTestFunctions.addMock(file, this.oneClass + 'Converter');
        unitTestFunctions.addLongParameter(file, `${this.otherClass.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.oneClass);
        unitTestFunctions.addBeanParameter(file, 'Json' + this.oneClass);
        unitTestFunctions.addBeanParameter(file, this.otherClass);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.oneClass}`);
        javaFunctions.addImport(file, `${params.basePackage}.core.service.${this.oneClass}Service`);
        javaFunctions.addImport(file, `${params.basePackage}.api.convert.${this.oneClass}Converter`);
        javaFunctions.addImport(file, `${params.basePackage}.domain.entities.Json${this.oneClass}`);
        javaFunctions.addImport(file, 'org.springframework.http.HttpStatus');
        javaFunctions.addImport(file, 'java.util.Optional');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }
}
