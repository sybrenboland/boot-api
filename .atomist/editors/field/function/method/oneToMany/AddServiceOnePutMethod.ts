import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";


export class AddServiceOnePutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addMethod(project, params);
        this.addUnitTests(project, params);
    }

    private addMethod(project: Project, params: Params): void {
        const rawJavaMethod = `
    public boolean update${this.oneClass}With${this.otherClass}(long ${this.oneClass.toLowerCase()}Id, ` +
            `long ${this.otherClass.toLowerCase()}Id) {
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ${javaFunctions.lowercaseFirst(this.oneClass)}Repository.` +
            `findById(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()}Optional.isPresent()) {
            ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Optional.get();

            Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ` +
            `${javaFunctions.lowercaseFirst(this.otherClass)}Repository.findById(${this.otherClass.toLowerCase()}Id);
            if (${this.otherClass.toLowerCase()}Optional.isPresent()) {

                ${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}Optional.get().toBuilder()
                        .${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()})
                        .build();
                ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.save(new${this.otherClass});
                return true;
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.oneClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "update" + this.oneClass + "With" + this.otherClass, rawJavaMethod);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

            javaFunctions.addToConstructor(
                file,
                this.oneClass + "Service",
                this.otherClass + "Repository",
                javaFunctions.lowercaseFirst(this.otherClass) + "Repository");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
        } else {
            console.error("Service class not added yet!");
        }
    }

    private addUnitTests(project: Project, params: Params) {

        const rawJavaMethod = `
        
    @Test
    public void testUpdate${this.oneClass}With${this.otherClass}_No${this.oneClass}Found() {

        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean result = ${this.oneClass.toLocaleLowerCase()}Service.update${this.oneClass}With${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        verify(${this.otherClass.toLocaleLowerCase()}Repository, never()).save(any(${this.otherClass}.class));
    }

    @Test
    public void testUpdate${this.oneClass}With${this.otherClass}_No${this.otherClass}Found() {

        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLocaleLowerCase()}));
        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean result = ${this.oneClass.toLocaleLowerCase()}Service.update${this.oneClass}With${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        verify(${this.otherClass.toLocaleLowerCase()}Repository, never()).save(any(${this.otherClass}.class));
    }

    @Test
    public void testUpdate${this.oneClass}With${this.otherClass}_With${this.oneClass}With${this.otherClass}() {

        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLocaleLowerCase()}));
        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLocaleLowerCase()}));

        boolean result = ${this.oneClass.toLocaleLowerCase()}Service.update${this.oneClass}With${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toUpperCase()}_ID);

        assertTrue("Wrong result returned!", result);
        verify(${this.otherClass.toLocaleLowerCase()}Repository, times(1)).save(any(${this.otherClass}.class));
    }`;

        const pathServiceUnitTest = params.coreModule + "/src/test/java/" + fileFunctions.toPath(params.basePackage) + "/core/service/" + this.oneClass + "ServiceTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestService(project, pathServiceUnitTest, this.oneClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.oneClass + 'Repository');
        unitTestFunctions.addMock(file, this.otherClass + 'Repository');
        unitTestFunctions.addLongParameter(file, `${this.oneClass.toUpperCase()}_ID`);
        unitTestFunctions.addLongParameter(file, `${this.otherClass.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.oneClass);
        unitTestFunctions.addBeanParameter(file, this.otherClass);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.oneClass}Repository`);
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.otherClass}Repository`);
        javaFunctions.addImport(file, 'java.util.Optional');

        javaFunctions.addImport(file, 'static org.junit.Assert.assertFalse');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.never');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.times');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.verify');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.any');
    }
}
