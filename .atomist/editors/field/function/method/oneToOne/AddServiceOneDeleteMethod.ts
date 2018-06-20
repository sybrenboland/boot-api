import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";

export class AddServiceOneDeleteMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addMethod(project, params);
        this.addUnitTests(project, params);
    }

    private addMethod(project: Project, params: Params): void {

        const rawJavaMethod = `
    public boolean remove${this.otherClass}(long ${this.oneClass.toLowerCase()}Id, ` +
            `long ${this.otherClass.toLowerCase()}Id) {
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ${javaFunctions.lowercaseFirst(this.oneClass)}Repository.` +
            `findById(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()}Optional.isPresent()) {
            ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Optional.get();

            Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ` +
            `${javaFunctions.lowercaseFirst(this.otherClass)}Repository.findById(${this.otherClass.toLowerCase()}Id);
            if (${this.otherClass.toLowerCase()}Optional.isPresent()) {
                ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Optional.get();

                if (${this.otherClass.toLowerCase()}.get${this.oneClass}() != null && ` +
            `${this.oneClass.toLowerCase()}.getId().equals(${this.otherClass.toLowerCase()}.get${this.oneClass}().getId())) {
    
                    ${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}.toBuilder()
                            .${this.oneClass.toLowerCase()}(null)
                            .build();
                    ${javaFunctions.lowercaseFirst(this.otherClass)}Repository.save(new${this.otherClass});
                    return true;
                }
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.oneClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "remove" + this.otherClass, rawJavaMethod);

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
    public void testRemove${this.otherClass}_No${this.oneClass}Found() {

        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean result = ${this.oneClass.toLocaleLowerCase()}Service.remove${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        verify(${this.oneClass.toLocaleLowerCase()}Repository, never()).save(any(${this.oneClass}.class));
    }

    @Test
    public void testRemove${this.otherClass}_${this.oneClass}HasNo${this.otherClass}() {

        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLocaleLowerCase()}));

        boolean result = ${this.oneClass.toLocaleLowerCase()}Service.remove${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        verify(${this.oneClass.toLocaleLowerCase()}Repository, never()).save(any(${this.oneClass}.class));
    }

    @Test
    public void testRemove${this.otherClass}_No${this.otherClass}Found() {

        ${this.oneClass} ${this.oneClass.toLocaleLowerCase()}With${this.otherClass} = ${this.oneClass.toLocaleLowerCase()}` +
            `.toBuilder().${this.otherClass.toLocaleLowerCase()}Set(Collections.singleton(${this.otherClass.toLocaleLowerCase()})).build();

        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLocaleLowerCase()}With${this.otherClass}));
        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean result = ${this.oneClass.toLocaleLowerCase()}Service.remove${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        verify(${this.oneClass.toLocaleLowerCase()}Repository, never()).save(any(${this.oneClass}.class));
    }

    @Test
    public void testRemove${this.otherClass}_${this.otherClass}IdsDoNotMatch() {

        ${this.oneClass} ${this.oneClass.toLowerCase()}WithId = ${this.oneClass.toLowerCase()}.toBuilder().id(${this.oneClass.toUpperCase()}_ID).build();
        ${this.otherClass} ${this.otherClass.toLowerCase()}With${this.oneClass} = ${this.otherClass.toLowerCase()}.toBuilder()` +
            `.id(${this.otherClass.toUpperCase()}_ID).${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()}).build();

        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLowerCase()}WithId));
        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLowerCase()}With${this.oneClass}));

        boolean result = ${this.oneClass.toLocaleLowerCase()}Service.remove${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        verify(${this.oneClass.toLocaleLowerCase()}Repository, never()).save(any(${this.oneClass}.class));
    }

    @Test
    public void testRemove${this.otherClass}_${this.otherClass}sMatch() {

        ${this.oneClass} ${this.oneClass.toLowerCase()}WithId = ${this.oneClass.toLowerCase()}.toBuilder().id(${this.oneClass.toUpperCase()}_ID).build();
        ${this.otherClass} ${this.otherClass.toLowerCase()}With${this.oneClass} = ${this.otherClass.toLowerCase()}.toBuilder()` +
            `.id(${this.otherClass.toUpperCase()}_ID).${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()}WithId).build();

        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLowerCase()}WithId));
        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLowerCase()}With${this.oneClass}));

        boolean result = ${this.oneClass.toLocaleLowerCase()}Service.remove${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toUpperCase()}_ID);

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

        unitTestFunctions.addMock(file, this.otherClass + 'Repository');
        unitTestFunctions.addMock(file, this.oneClass + 'Repository');
        unitTestFunctions.addLongParameter(file, `${this.otherClass.toUpperCase()}_ID`);
        unitTestFunctions.addLongParameter(file, `${this.oneClass.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.otherClass);
        unitTestFunctions.addBeanParameter(file, this.oneClass);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.otherClass}Repository`);
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.oneClass}Repository`);
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.otherClass}`);
        javaFunctions.addImport(file, 'java.util.Optional');
        javaFunctions.addImport(file, 'java.util.Collections');

        javaFunctions.addImport(file, 'static org.junit.Assert.assertFalse');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.never');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.times');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.verify');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.any');
    }
}
