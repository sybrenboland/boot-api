import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";


export class AddResourceOneGetMethod extends EditFunction {

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
    public ResponseEntity get${this.otherClass}s(@PathVariable long ${this.oneClass.toLowerCase()}Id) {
        List<${this.otherClass}> ${this.otherClass.toLowerCase()}List = ` +
            `${javaFunctions.lowercaseFirst(this.otherClass)}Service.fetch${this.otherClass}sFor${this.oneClass}` +
            `(${this.oneClass.toLowerCase()}Id);

        JsonSearchResult<Json${this.otherClass}> result = JsonSearchResult.<Json${this.otherClass}>builder()
                .results(${this.otherClass.toLowerCase()}List.stream().` +
            `map(${this.otherClass.toLowerCase()}Converter::toJson).collect(Collectors.toList()))
                .numberOfResults(${this.otherClass.toLowerCase()}List.size())
                .grandTotalNumberOfResults(${this.otherClass.toLowerCase()}List.size())
                .build();
        
        return ResponseEntity.ok(result);
    }`;

        const path = params.apiModule + params.basePath + "/api/resource/" + this.oneClass + "Controller.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "get" + this.otherClass + "s", rawJavaMethod);

            javaFunctions.addImport(file, "java.util.List");
            javaFunctions.addImport(file, " java.util.stream.Collectors");
            javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
            javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".domain.entities.Json" + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".domain.entities.JsonSearchResult");

            javaFunctions.addToConstructor(
                file,
                this.oneClass + "Controller",
                this.otherClass + "Service",
                javaFunctions.lowercaseFirst(this.otherClass) + "Service");
            javaFunctions.addImport(file, params.basePackage + ".core.service." + this.otherClass + "Service");

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

    private addUnitTests(project: Project, params: Params) {

        const rawJavaMethod = `
        
    @Test
    public void testGet${this.otherClass}s_No${this.otherClass}Found() {

        when(${this.otherClass.toLowerCase()}Service.fetch${this.otherClass}sFor${this.oneClass}(${this.oneClass.toUpperCase()}_ID)).thenReturn(new ArrayList<>());

        ResponseEntity response = ${this.oneClass.toLocaleLowerCase()}Controller.get${this.otherClass}s(${this.oneClass.toUpperCase()}_ID);


        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
        assertTrue("Returned object of wrong type!", response.getBody() instanceof JsonSearchResult);
        JsonSearchResult jsonSearchResult = (JsonSearchResult) response.getBody();
        assertEquals("Wrong object returned!", new Integer(0), jsonSearchResult.getGrandTotalNumberOfResults());
        assertEquals("Wrong object returned!", new Integer(0), jsonSearchResult.getNumberOfResults());
        assertTrue("Wrong object returned!", jsonSearchResult.getResults().isEmpty());
    }

    @Test
    public void testGet${this.otherClass}s_Multiple${this.otherClass}sFound() {

        when(${this.otherClass.toLowerCase()}Service.fetch${this.otherClass}sFor${this.oneClass}(${this.oneClass.toUpperCase()}_ID)).thenReturn(Arrays.asList(
                ${this.otherClass}.builder().build(),
                ${this.otherClass}.builder().build()));
        when(${this.otherClass.toLowerCase()}Converter.toJson(any()))
                .thenReturn(Json${this.otherClass}.builder().build())
                .thenReturn(Json${this.otherClass}.builder().build());

        ResponseEntity response = ${this.oneClass.toLocaleLowerCase()}Controller.get${this.otherClass}s(${this.oneClass.toUpperCase()}_ID);


        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
        assertTrue("Returned object of wrong type!", response.getBody() instanceof JsonSearchResult);
        JsonSearchResult jsonSearchResult = (JsonSearchResult) response.getBody();
        assertEquals("Wrong object returned!", new Integer(2), jsonSearchResult.getGrandTotalNumberOfResults());
        assertEquals("Wrong object returned!", new Integer(2), jsonSearchResult.getNumberOfResults());
        assertEquals("Wrong number of objects returned!", 2, jsonSearchResult.getResults().size());
    }`;

        const pathServiceUnitTest = params.apiModule + "/src/main/test/java/" + fileFunctions.toPath(params.basePackage) + "/api/resource/" + this.otherClass + "ControllerTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestController(project, pathServiceUnitTest, this.otherClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.oneClass + 'Service');
        unitTestFunctions.addMock(file, this.oneClass + 'Converter');
        unitTestFunctions.addLongParameter(file, `${this.oneClass.toUpperCase()}_ID`);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.domain.entities.JsonSearchResult`);
        javaFunctions.addImport(file, `${params.basePackage}.core.service.${this.oneClass}Service`);
        javaFunctions.addImport(file, `${params.basePackage}.api.convert.${this.oneClass}Converter`);
        javaFunctions.addImport(file, 'org.springframework.http.HttpStatus');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
        javaFunctions.addImport(file, 'static org.mockito.ArgumentMatchers.any');
    }
}
