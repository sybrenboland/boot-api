import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";


export class AddServiceManyPutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private mappingSide: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addMethod(project, params);
        this.addUnitTests(project, params);
    }

    private addMethod(project: Project, params: Params) {

        const save = this.mappingSide ?
            `${this.oneClass} new${this.oneClass} = ${this.oneClass.toLowerCase()}Optional.get().toBuilder()
                        .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()}Optional.get())
                        .build();
                ${javaFunctions.lowercaseFirst(this.oneClass)}Repository.save(new${this.oneClass});` :
            `${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}Optional.get().toBuilder()
                        .${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()}Optional.get())
                        .build();
                ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.save(new${this.otherClass});`;

        const rawJavaMethod = `
    public boolean update${this.otherClass}With${this.oneClass}(long ${this.otherClass.toLowerCase()}Id, ` +
            `long ${this.oneClass.toLowerCase()}Id) {
        Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.` +
            `findById(${this.otherClass.toLowerCase()}Id);
        if (${this.otherClass.toLowerCase()}Optional.isPresent()) {

            Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ` +
            `${javaFunctions.lowercaseFirst(this.oneClass)}Repository.findById(${this.oneClass.toLowerCase()}Id);
            if (${this.oneClass.toLowerCase()}Optional.isPresent()) {

                ${save}
                return true;
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.otherClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "update" + this.otherClass + "With" + this.oneClass, rawJavaMethod);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);

            javaFunctions.addToConstructor(
                file,
                this.otherClass + "Service",
                this.oneClass + "Repository",
                javaFunctions.lowercaseFirst(this.oneClass) + "Repository");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.oneClass + "Repository");
            javaFunctions.addImport(file, "java.util.Optional");
        } else {
            console.error("Service class not added yet!");
        }
    }

    private addUnitTests(project: Project, params: Params) {

        const rawJavaMethod = `
        
    @Test
    public void testUpdate${this.otherClass}With${this.oneClass}_No${this.otherClass}Found() {

        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean result = ${this.otherClass.toLocaleLowerCase()}Service.update${this.otherClass}With${this.oneClass}(${this.otherClass.toUpperCase()}_ID, ${this.oneClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        verify(${this.otherClass.toLocaleLowerCase()}Repository, never()).save(any(${this.otherClass}.class));
    }

    @Test
    public void testUpdate${this.otherClass}With${this.oneClass}_No${this.oneClass}Found() {

        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLocaleLowerCase()}));
        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean result = ${this.otherClass.toLocaleLowerCase()}Service.update${this.otherClass}With${this.oneClass}(${this.otherClass.toUpperCase()}_ID, ${this.oneClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        verify(${this.otherClass.toLocaleLowerCase()}Repository, never()).save(any(${this.otherClass}.class));
    }

    @Test
    public void testUpdate${this.otherClass}With${this.oneClass}_With${this.otherClass}With${this.oneClass}() {

        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLocaleLowerCase()}));
        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLocaleLowerCase()}));

        boolean result = ${this.otherClass.toLocaleLowerCase()}Service.update${this.otherClass}With${this.oneClass}(${this.otherClass.toUpperCase()}_ID, ${this.oneClass.toUpperCase()}_ID);

        assertTrue("Wrong result returned!", result);
        verify(${this.otherClass.toLocaleLowerCase()}Repository, times(1)).save(any(${this.otherClass}.class));
    }`;

        const pathServiceUnitTest = params.coreModule + "/src/main/test/java/" + fileFunctions.toPath(params.basePackage) + "/core/service/" + this.otherClass + "ServiceTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestService(project, pathServiceUnitTest, this.otherClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.otherClass + 'Repository');
        unitTestFunctions.addMock(file, this.oneClass + 'Repository');
        unitTestFunctions.addLongParameter(file, `${this.otherClass.toUpperCase()}_ID`);
        unitTestFunctions.addLongParameter(file, `${this.oneClass.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.otherClass);
        unitTestFunctions.addBeanParameter(file, this.oneClass);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.otherClass}Repository`);
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.oneClass}Repository`);
        javaFunctions.addImport(file, 'java.util.Optional');

        javaFunctions.addImport(file, 'static org.junit.Assert.assertFalse');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.never');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.times');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.verify');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }
}
