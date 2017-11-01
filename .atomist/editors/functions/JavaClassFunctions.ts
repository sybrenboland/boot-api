import {File} from "@atomist/rug/model/File";

export class JavaClassFunctions {

    public addFunction(file: File, newFunctionName: string, newFunction: string): void {
        if (!file.contains(newFunctionName)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + newFunction);
        }
    }

    public addAnnotationToClass(file: File, newAnnotation: string): void {
        if (!file.contains(newAnnotation)) {
            const classInput = "public class";
            const annotationReplacement = newAnnotation + "\n" + classInput;

            file.replace(classInput, annotationReplacement);
        }
    }

    public addImport(file: File, newImport: string): void {
        if (!file.contains(newImport)) {
            const newImportInput = ["import " + newImport + ";"];

            const newContent = file.content.split("\n").slice(0, 2)
                .concat(newImportInput
                    .concat(file.content.split("\n").slice(2)))
                .reduce((a, b) => a + "\n" + b);

            file.setContent(newContent);
        }
    }
}

export const javaFunctions = new JavaClassFunctions();
