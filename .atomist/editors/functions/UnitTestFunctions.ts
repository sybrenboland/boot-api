import { Project } from "@atomist/rug/model/Project";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "./JavaClassFunctions";

export class UnitTestFunctions {

    public basicUnitTest(project: Project, path: string, className: string, basePackage: string) {

        const rawUnitTest = `package ${basePackage}.api.resource;

import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ${className}ControllerTest {
    
    @InjectMocks
    private ${className}Controller ${className.toLowerCase()}Controller;
    
    // @InputMock
    
    // @Input
}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawUnitTest);
        }
    }

    addMock(file: File, mockClass: string) {

        const mockInput = '// @InputMock';
        const rawMock = `@Mock
    private ${mockClass} ${javaFunctions.lowercaseFirst(mockClass)};

` + mockInput;

        if (!file.contains(mockClass)) {
            file.replace(mockInput, rawMock);
            javaFunctions.addImport(file, 'org.mockito.Mock');
        }
    }

    addLongParameter(file: File, name: string) {

        const parameterHook = '// @InputMock';
        const rawParameter = parameterHook + `
        private static final long ${name} = 3L;`;

        if (!file.contains(name)) {
            file.replace(parameterHook, rawParameter);
        }
    }

    addBeanParameter(file: File, className: string) {

        const parameterHook = '// @InputMock';
        const rawParameter = `private ${className} ${className.toLowerCase()} = ${className}.builder().build();
        
        ` + parameterHook;

        if (!file.contains(name)) {
            file.replace(parameterHook, rawParameter);
        }
    }
}

export const unitTestFunctions = new UnitTestFunctions();
