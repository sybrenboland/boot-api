import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";

export class AddResourceOnePutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addMethod(project, params);
        this.addUnitTest(project, params);
    }

    private addMethod(project: Project, params: Params) {

        const rawJavaMethod = `
    @Override
    public ResponseEntity put${this.otherClass}With${this.oneClass}` +
            `(@PathVariable long ${this.oneClass.toLowerCase()}Id, ` +
            `@RequestBody Json${this.otherClass} json${this.otherClass}) {

        ${this.otherClass} new${this.otherClass} = ${this.oneClass.toLowerCase()}Service.` +
            `update${this.oneClass}With${this.otherClass}(${this.oneClass.toLowerCase()}Id, ` +
            `${javaFunctions.lowercaseFirst(this.otherClass)}Converter.fromJson(json${this.otherClass}));

        return  new${this.otherClass} != null ?
                ResponseEntity.ok(${javaFunctions.lowercaseFirst(this.otherClass)}Converter.toJson(new${this.otherClass})) :
                ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/api/resource/" + this.oneClass + "Controller.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "put" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

            javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
            javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
            javaFunctions.addImport(file, params.basePackage + ".domain.entities.Json" + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

            javaFunctions.addToConstructor(
                file,
                this.oneClass + "Controller",
                this.otherClass + "Converter",
                javaFunctions.lowercaseFirst(this.otherClass) + "Converter");
            javaFunctions.addImport(file, params.basePackage + ".api.convert." + this.otherClass + "Converter");
        } else {
            console.error("Resource class not added yet!");
        }
    }

    private addUnitTest(project: Project, params: Params) {

        const rawJavaMethod = ` 
        
    @Test
    public void testPut${this.otherClass}With${this.oneClass}_No${this.otherClass}Found() {

        when(${this.otherClass.toLowerCase()}Converter.fromJson(json${this.otherClass})).thenReturn(${this.otherClass.toLowerCase()});
        when(${this.oneClass.toLowerCase()}Service.update${this.oneClass}With${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toLowerCase()})).thenReturn(null);

        ResponseEntity response = ${this.oneClass.toLowerCase()}Controller.put${this.otherClass}With${this.oneClass}(${this.oneClass.toUpperCase()}_ID, json${this.otherClass});

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.NOT_FOUND.value(), response.getStatusCodeValue());
    }

    @Test
    public void testPut${this.otherClass}With${this.oneClass}() {

        when(${this.otherClass.toLowerCase()}Converter.fromJson(json${this.otherClass})).thenReturn(${this.otherClass.toLowerCase()});
        when(${this.oneClass.toLowerCase()}Service.update${this.oneClass}With${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toLowerCase()})).thenReturn(${this.otherClass.toLowerCase()});
        when(${this.otherClass.toLowerCase()}Converter.toJson(${this.otherClass.toLowerCase()})).thenReturn(json${this.otherClass});

        ResponseEntity response = ${this.oneClass.toLowerCase()}Controller.put${this.otherClass}With${this.oneClass}(${this.oneClass.toUpperCase()}_ID, json${this.otherClass});

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
        assertTrue("Returned object of wrong type!", response.getBody() instanceof Json${this.otherClass});
        assertEquals("Wrong object returned!", json${this.otherClass}, response.getBody());
    }`;

        const pathServiceUnitTest = params.apiModule + "/src/test/java/" + fileFunctions.toPath(params.basePackage) + "/api/resource/" + this.oneClass + "ControllerTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestController(project, pathServiceUnitTest, this.oneClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.oneClass + 'Service');
        unitTestFunctions.addMock(file, this.otherClass + 'Converter');
        unitTestFunctions.addLongParameter(file, `${this.oneClass.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.otherClass);
        unitTestFunctions.addBeanParameter(file, 'Json' + this.otherClass);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.otherClass}`);
        javaFunctions.addImport(file, `${params.basePackage}.domain.entities.Json${this.otherClass}`);
        javaFunctions.addImport(file, `${params.basePackage}.core.service.${this.oneClass}Service`);
        javaFunctions.addImport(file, `${params.basePackage}.api.convert.${this.otherClass}Converter`);
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }
}
