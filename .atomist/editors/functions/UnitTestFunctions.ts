import { Project } from "@atomist/rug/model/Project";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "./JavaClassFunctions";

export class UnitTestFunctions {

    public basicUnitTestController(project: Project, path: string, className: string, basePackage: string) {

        const rawUnitTest = `package ${basePackage}.api.resource;

import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ${className}ControllerTest {
    
    @InjectMocks
    private ${className}Controller ${className.toLowerCase()}Controller;
    
    // @MockInput
    
    // @Input
}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawUnitTest);
        }
    }

    public basicUnitTestService(project: Project, path: string, className: string, basePackage: string) {

        const rawUnitTest = `package ${basePackage}.core.service;

import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class ${className}ServiceTest {
    
    @InjectMocks
    private ${className}Service ${className.toLowerCase()}Service;
    
    // @MockInput
    
    // @Input
}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawUnitTest);
        }
    }

    addMock(file: File, mockClass: string) {

        const mockInput = '// @MockInput';
        const rawMock = `@Mock
    private ${mockClass} ${javaFunctions.lowercaseFirst(mockClass)};

    ` + mockInput;

        if (!file.contains(`${mockClass} ${javaFunctions.lowercaseFirst(mockClass)};`)) {
            file.replace(mockInput, rawMock);
            javaFunctions.addImport(file, 'org.mockito.Mock');
        }
    }

    addLongParameter(file: File, name: string) {

        const parameterHook = '// @MockInput';
        const rawParameter = parameterHook + `
        
    private static final long ${name} = 3L;`;

        if (!file.contains(`long ${name} =`)) {
            file.replace(parameterHook, rawParameter);
        }
    }

    addBeanParameter(file: File, className: string) {

        const parameterHook = '// @MockInput';
        const rawParameter = parameterHook + `
        
    private ${className} ${javaFunctions.lowercaseFirst(className)} = ${className}.builder().build();`;

        if (!file.contains(`${className} ${javaFunctions.lowercaseFirst(className)}`)) {
            file.replace(parameterHook, rawParameter);
        }
    }

    getValue(type: string, number: number) {

        let value: string;
        switch (type) {
            case "String":
                value = number === 0 ? "string" : "other string";
                break;
            case "Integer":
                value = number === 0 ? "2" : "3";
                break;
            case "Long":
                value = number === 0 ? "4L" : "5L";
                break;
            case "Boolean":
                value = number === 0 ? "false" : "true";
                break;
        }
    }

    addIntParameter(file: File, name: string) {

        const parameterHook = '// @MockInput';
        const rawParameter = parameterHook + `
        
    private static final int ${name} = 2;`;

        if (!file.contains(`int ${name} =`)) {
            file.replace(parameterHook, rawParameter);
        }
    }
}

export const unitTestFunctions = new UnitTestFunctions();
