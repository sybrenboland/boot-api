import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {unitTestFunctions} from "../../../../functions/UnitTestFunctions";

export class AddServiceOnePutMethodUni extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addMethod(project, params);
        this.addUnitTest(project, params);
    }

    private addMethod(project: Project, params: Params) {

        const rawJavaMethod = `
    public ${this.otherClass} update${this.oneClass}With${this.otherClass}` +
            `(long ${this.oneClass.toLowerCase()}Id, ${this.otherClass} ${this.otherClass.toLowerCase()}) {
        Optional<${this.oneClass}> ${this.oneClass.toLowerCase()} = ` +
            `${this.oneClass.toLowerCase()}Repository.findById(${this.oneClass.toLowerCase()}Id);
        if (${this.oneClass.toLowerCase()}.isPresent()) {

            ${this.oneClass} new${this.oneClass} = ${this.oneClass.toLowerCase()}.get().toBuilder()
                    .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})
                    .build();
            ${this.oneClass.toLowerCase()}Repository.save(new${this.oneClass});

            return ${this.otherClass.toLowerCase()};
        }

        return null;
    }`;

        const path = params.coreModule + params.basePath + "/core/service/" + this.oneClass + "Service.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, "update" + this.oneClass + "With" + this.otherClass,
                rawJavaMethod);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
            javaFunctions.addImport(file, "java.util.Optional");
        } else {
            console.error("Service class not added yet!");
        }
    }

    private addUnitTest(project: Project, params: Params) {

        const rawJavaMethod = `
        
    @Test
    public void testUpdate${this.oneClass}With${this.otherClass}_No${this.oneClass}Found() {

        when(${this.oneClass.toLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.empty());

        ${this.otherClass} result${this.otherClass} = ${this.oneClass.toLowerCase()}Service.` +
            `update${this.oneClass}With${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toLowerCase()});

        assertNull("Wrong result returned!", result${this.otherClass});
        verify(${this.oneClass.toLowerCase()}Repository, never()).save(any(${this.oneClass}.class));
    }

    @Test
    public void testUpdate${this.oneClass}With${this.otherClass}() {

        when(${this.oneClass.toLowerCase()}Repository.findById(${this.oneClass.toUpperCase()}_ID)).thenReturn(Optional.of(${this.oneClass.toLowerCase()}));

        ${this.otherClass} result${this.otherClass} = ${this.oneClass.toLowerCase()}Service.` +
            `update${this.oneClass}With${this.otherClass}(${this.oneClass.toUpperCase()}_ID, ${this.otherClass.toLowerCase()});

        assertNotNull("Wrong result returned!", result${this.otherClass});
        assertEquals("Wrong object returned!", ${this.otherClass.toLowerCase()}, result${this.otherClass});
        verify(${this.oneClass.toLowerCase()}Repository, times(1)).save(any(${this.oneClass}.class));
    }`;

        const pathServiceUnitTest = `${params.coreModule}/src/test/java/${fileFunctions.toPath(params.basePackage)}/core/service/${this.oneClass}ServiceTest.java`;
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestService(project, pathServiceUnitTest, this.oneClass, params.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.oneClass + 'Repository');
        unitTestFunctions.addLongParameter(file, `${this.oneClass.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.otherClass);
        unitTestFunctions.addBeanParameter(file, this.oneClass);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.repo.${this.oneClass}Repository`);
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.otherClass}`);
        javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.oneClass}`);
        javaFunctions.addImport(file, 'java.util.Optional');

        javaFunctions.addImport(file, 'static org.junit.Assert.assertNull');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.never');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.times');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.verify');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.any');
    }
}
