import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";

export class AddResourceOneDeleteMethodUni extends EditFunction {

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
    public ResponseEntity delete${this.otherClass}With${this.oneClass}(@PathVariable long ` +
            `${this.oneClass.toLowerCase()}Id) {
        // Use only with @MapsId mapping
        long ${this.otherClass.toLowerCase()}Id = ${this.oneClass.toLowerCase()}Id;

        return ${this.otherClass.toLowerCase()}Service.delete${this.otherClass}(${this.otherClass.toLowerCase()}Id) ?
                ResponseEntity.ok().build() :
                ResponseEntity.notFound().build();
    }`;

        const path = params.apiModule + params.basePath + "/api/resource/" + this.oneClass + "Controller.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "delete" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

            javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
            javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        } else {
            console.error("Resource class not added yet!");
        }
    }

    private addUnitTest(project: Project, params: Params) {

        const rawJavaMethod = ` 
        
   @Test
    public void testDelete${this.otherClass}With${this.oneClass}_No${this.otherClass}Found() {

        when(${this.otherClass.toLowerCase()}Service.delete${this.otherClass}(${this.oneClass.toUpperCase()}_ID)).thenReturn(false);

        ResponseEntity response = ${this.oneClass.toLowerCase()}Controller.delete${this.otherClass}With${this.oneClass}(${this.oneClass.toUpperCase()}_ID);

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.NOT_FOUND.value(), response.getStatusCodeValue());
    }

    @Test
    public void testDelete${this.otherClass}With${this.oneClass}() {

        when(${this.otherClass.toLowerCase()}Service.delete${this.otherClass}(${this.oneClass.toUpperCase()}_ID)).thenReturn(true);

        ResponseEntity response = ${this.oneClass.toLowerCase()}Controller.delete${this.otherClass}With${this.oneClass}(${this.oneClass.toUpperCase()}_ID);

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
    }`;

        const pathServiceUnitTest = params.apiModule + "/src/test/java/" + fileFunctions.toPath(params.basePackage) + "/api/resource/" + this.oneClass + "ControllerTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestController(project, pathServiceUnitTest, this.oneClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.otherClass + 'Service');
        unitTestFunctions.addLongParameter(file, `${this.oneClass.toUpperCase()}_ID`);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.core.service.${this.otherClass}Service`);
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }
}
