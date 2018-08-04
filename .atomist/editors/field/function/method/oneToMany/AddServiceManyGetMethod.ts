import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";

export class AddServiceGetMethodMany extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addMethod(project, params);
        this.addUnitTests(project, params);
    }

    private addMethod(project: Project, params: Params) {

        const rawJavaMethod = `
    public Optional<${this.oneClass}> fetch${this.oneClass}For${this.otherClass}` +
            `(long ${this.otherClass.toLowerCase()}Id) {
        Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.findById` +
            `(${this.otherClass.toLowerCase()}Id);
        return ${this.otherClass.toLowerCase()}Optional.isPresent() && ${this.otherClass.toLowerCase()}Optional.get().` +
            `get${this.oneClass}() != null ? 
                Optional.of(${this.otherClass.toLowerCase()}Optional.get().get${this.oneClass}()) : 
                Optional.empty();
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.oneClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "fetch" + this.oneClass + "sFor" + this.otherClass, rawJavaMethod);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

            javaFunctions.addToConstructor(
                file,
                this.oneClass + "Service",
                this.otherClass + "Repository",
                javaFunctions.lowercaseFirst(this.otherClass) + "Repository");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
            javaFunctions.addImport(file, "java.util.Optional");
        } else {
            console.error("Service class not added yet!");
        }
    }

    private addUnitTests(project: Project, params: Params) {

        const rawJavaMethod = `

    @Test
    public void testFetch${this.oneClass}For${this.otherClass}_No${this.otherClass}Found() {

        when(${this.otherClass.toLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        Optional<${this.oneClass}> result = ${this.oneClass.toLowerCase()}Service.fetch${this.oneClass}For${this.otherClass}(${this.otherClass.toUpperCase()}_ID);

        assertNotNull("No object returned!", result);
        assertFalse("Wrong object returned!", result.isPresent());
    }

    @Test
    public void testFetch${this.oneClass}For${this.otherClass}_With${this.otherClass}No${this.oneClass}() {

        when(${this.otherClass.toLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLowerCase()}));

        Optional<${this.oneClass}> result = ${this.oneClass.toLowerCase()}Service.fetch${this.oneClass}For${this.otherClass}(${this.otherClass.toUpperCase()}_ID);

        assertNotNull("No object returned!", result);
        assertFalse("Wrong object returned!", result.isPresent());
    }

    @Test
    public void testFetch${this.oneClass}For${this.otherClass}_With${this.otherClass}With${this.oneClass}() {

        ${this.otherClass} ${this.otherClass.toLowerCase()}With${this.oneClass} = ${this.otherClass.toLowerCase()}.toBuilder().${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()}).build();
        when(${this.otherClass.toLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLowerCase()}With${this.oneClass}));

        Optional<${this.oneClass}> result = ${this.oneClass.toLowerCase()}Service.fetch${this.oneClass}For${this.otherClass}(${this.otherClass.toUpperCase()}_ID);

        assertNotNull("No object returned!", result);
        assertTrue("Wrong object returned!", result.isPresent());
        assertEquals("Wrong object returned!", ${this.oneClass.toLowerCase()}, result.get());
    }`;

        const pathServiceUnitTest = params.coreModule + "/src/test/java/" + fileFunctions.toPath(params.basePackage) + "/core/service/" + this.oneClass + "ServiceTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestService(project, pathServiceUnitTest, this.oneClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.otherClass + 'Repository');
        unitTestFunctions.addLongParameter(file, `${this.otherClass.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.otherClass);
        unitTestFunctions.addBeanParameter(file, this.oneClass);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.otherClass}`);
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.otherClass}Repository`);
        javaFunctions.addImport(file, 'java.util.Optional');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertFalse');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }
}
