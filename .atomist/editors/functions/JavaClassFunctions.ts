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

    public addMemberToClass(file: File, member: string) {
        const memberInputHook = "// @FieldInput";
        const argumentReplacement = member + ";\n    " + memberInputHook;

        file.replace(memberInputHook, argumentReplacement);
    }

    public addConstructorArgument(file: File, className: string, argument: string) {
        const constructorInputHook = className + "(";
        const argumentReplacement = constructorInputHook + argument + ", ";

        file.replace(constructorInputHook, argumentReplacement);
    }

    public addConstructorAssignment(file: File, argumentName: string) {
        const constructorInputHook = "// @ConstructorInput";
        const argumentReplacement = "this." + argumentName + " = " + argumentName + ";\n        " + constructorInputHook;

        file.replace(constructorInputHook, argumentReplacement);
    }

    public capitalize(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
}

export const javaFunctions = new JavaClassFunctions();
