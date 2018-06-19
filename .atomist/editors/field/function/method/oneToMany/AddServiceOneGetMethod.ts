import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";


export class AddServiceOneGetMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addMethod(project, params);
        this.addUnitTests(project, params);
    }

    private addMethod(project: Project, params: Params) {

        const rawJavaMethod = `
    public List<${this.otherClass}> fetch${this.otherClass}sFor${this.oneClass}` +
            `(long ${this.oneClass.toLowerCase()}Id) {
        ${this.otherClass}SearchCriteria ${this.otherClass.toLowerCase()}SearchCriteria = ` +
            ` ${this.otherClass}SearchCriteria.builder()
                .${this.oneClass.toLowerCase()}Id(Optional.of(${this.oneClass.toLowerCase()}Id))
                .build();

        return ${this.otherClass.toLowerCase()}Repository.` +
            `findBySearchCriteria(${this.otherClass.toLowerCase()}SearchCriteria);
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.otherClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "fetch" + this.otherClass + "sFor" + this.oneClass, rawJavaMethod);

            javaFunctions.addImport(file, "java.util.List");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
        } else {
            console.error("Service class not added yet!");
        }
    }

    private addUnitTests(project: Project, params: Params) {

        const rawJavaMethod = `

    @Test
    public void testFetch${this.otherClass}sFor${this.oneClass}() {

        when(${this.otherClass.toLocaleLowerCase()}Repository.findBySearchCriteria(any())).thenReturn(Collections.singletonList(${this.otherClass.toLocaleLowerCase()}));

        List<${this.otherClass}> result${this.otherClass}List = ${this.otherClass.toLocaleLowerCase()}Service.fetch${this.otherClass}sFor${this.oneClass}(${this.otherClass.toUpperCase()}_ID);

        assertNotNull("No object returned!", result${this.otherClass}List);
        assertEquals("Wrong number of objects returned!", 1, result${this.otherClass}List.size());
        assertEquals("Wrong object returned!", ${this.otherClass.toLocaleLowerCase()}, result${this.otherClass}List.get(0));
    }`;

        const pathServiceUnitTest = params.coreModule + "/src/test/java/" + fileFunctions.toPath(params.basePackage) + "/core/service/" + this.otherClass + "ServiceTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestService(project, pathServiceUnitTest, this.otherClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.otherClass + 'Repository');
        unitTestFunctions.addLongParameter(file, `${this.otherClass.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.otherClass);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.otherClass}Repository`);
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }
}
