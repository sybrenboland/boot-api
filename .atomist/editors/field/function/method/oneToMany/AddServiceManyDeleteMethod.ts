import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";

export class AddServiceManyDeleteMethod extends EditFunction {

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
                            .${this.otherClass.toLowerCase()}(null)
                            .build();
                    ${this.oneClass.toLowerCase()}Repository.save(new${this.oneClass});` :
            `${this.otherClass} new${this.otherClass} = ${this.otherClass.toLowerCase()}.toBuilder()
                            .${this.oneClass.toLowerCase()}(null)
                            .build();
                    ${this.otherClass.toLowerCase()}Repository.save(new${this.otherClass});`;

        const rawJavaMethod = `
    public boolean remove${this.oneClass}(long ${this.otherClass.toLowerCase()}Id, ` +
            `long ${this.oneClass.toLowerCase()}Id) {
        Optional<${this.otherClass}> ${this.otherClass.toLowerCase()}Optional = ${this.otherClass.toLowerCase()}Repository.` +
            `findById(${this.otherClass.toLowerCase()}Id);
        if (${this.otherClass.toLowerCase()}Optional.isPresent()) {
            ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Optional.get();
         
            if (${this.otherClass.toLowerCase()}.get${this.oneClass}() != null) {

                Optional<${this.oneClass}> ${this.oneClass.toLowerCase()}Optional = ` +
                `${this.oneClass.toLowerCase()}Repository.findById(${this.oneClass.toLowerCase()}Id);
                if (${this.oneClass.toLowerCase()}Optional.isPresent() && ${this.oneClass.toLowerCase()}Optional.get().getId().` +
                `equals(${this.otherClass.toLowerCase()}.get${this.oneClass}().getId())) {
    
                    ${save}
                    return true;
                }
            }
        }

        return false;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.otherClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "remove" + this.oneClass, rawJavaMethod);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, "java.util.Optional");
        } else {
            console.error("Service class not added yet!");
        }
    }

    private addUnitTests(project: Project, params: Params) {

        const saveAssertion = this.mappingSide ?
            `verify(${this.oneClass.toLocaleLowerCase()}Repository, never()).save(any(${this.oneClass}.class));` :
            `verify(${this.otherClass.toLocaleLowerCase()}Repository, never()).save(any(${this.otherClass}.class));`;

        const rawJavaMethod = `
        
    @Test
    public void testRemove${this.oneClass}_No${this.otherClass}Found() {

        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean result = ${this.otherClass.toLocaleLowerCase()}Service.remove${this.oneClass}(${this.otherClass.toUpperCase()}_ID, ${this.oneClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        ${saveAssertion}
    }

    @Test
    public void testRemove${this.oneClass}_${this.otherClass}HasNo${this.oneClass}() {

        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLocaleLowerCase()}));

        boolean result = ${this.otherClass.toLocaleLowerCase()}Service.remove${this.oneClass}(${this.otherClass.toUpperCase()}_ID, ${this.oneClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        ${saveAssertion}
    }

    @Test
    public void testRemove${this.oneClass}_No${this.oneClass}Found() {

        ${this.otherClass} ${this.otherClass.toLocaleLowerCase()}With${this.oneClass} = ${this.otherClass.toLocaleLowerCase()}` +
            `.toBuilder().${this.oneClass.toLocaleLowerCase()}(${this.oneClass.toLocaleLowerCase()}).build();

        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLocaleLowerCase()}With${this.oneClass}));
        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        boolean result = ${this.otherClass.toLocaleLowerCase()}Service.remove${this.oneClass}(${this.otherClass.toUpperCase()}_ID, ${this.oneClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        ${saveAssertion}
    }

    @Test
    public void testRemove${this.oneClass}_${this.oneClass}IdsDoNotMatch() {

        ${this.oneClass} ${this.oneClass.toLocaleLowerCase()}WithId = ${this.oneClass.toLocaleLowerCase()}.toBuilder().id(${this.oneClass.toUpperCase()}_ID).build();
        ${this.otherClass} ${this.otherClass.toLocaleLowerCase()}With${this.oneClass} = ${this.otherClass.toLocaleLowerCase()}` +
            `.toBuilder().${this.oneClass.toLocaleLowerCase()}(${this.oneClass}.builder().id(${this.oneClass.toUpperCase()}_ID + 1).build()).build();

        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLocaleLowerCase()}With${this.oneClass}));
        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLocaleLowerCase()}WithId));

        boolean result = ${this.otherClass.toLocaleLowerCase()}Service.remove${this.oneClass}(${this.otherClass.toUpperCase()}_ID, ${this.oneClass.toUpperCase()}_ID);

        assertFalse("Wrong result returned!", result);
        ${saveAssertion}
    }

    @Test
    public void testRemove${this.oneClass}_${this.oneClass}sMatch() {

        ${this.oneClass} ${this.oneClass.toLocaleLowerCase()}WithId = ${this.oneClass.toLocaleLowerCase()}.toBuilder().id(${this.oneClass.toUpperCase()}_ID).build();
        ${this.otherClass} ${this.otherClass.toLocaleLowerCase()}With${this.oneClass} = ${this.otherClass.toLocaleLowerCase()}` +
            `.toBuilder().${this.oneClass.toLocaleLowerCase()}(${this.oneClass.toLocaleLowerCase()}WithId).build();

        when(${this.otherClass.toLocaleLowerCase()}Repository.findById(${this.otherClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.otherClass.toLocaleLowerCase()}With${this.oneClass}));
        when(${this.oneClass.toLocaleLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLocaleLowerCase()}WithId));

        boolean result = ${this.otherClass.toLocaleLowerCase()}Service.remove${this.oneClass}(${this.otherClass.toUpperCase()}_ID, ${this.oneClass.toUpperCase()}_ID);

        assertTrue("Wrong result returned!", result);
        ${saveAssertion.replace('never()', 'times(1)')}
    }`;

        const pathServiceUnitTest = params.coreModule + "/src/test/java/" + fileFunctions.toPath(params.basePackage) + "/core/service/" + this.otherClass + "ServiceTest.java";
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
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.oneClass}`);
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
