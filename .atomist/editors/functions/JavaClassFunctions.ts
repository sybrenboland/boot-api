import {File} from "@atomist/rug/model/File";

export class JavaClassFunctions {

    public addFunction(file: File, newFunctionName: string, newFunction: string): void {
        if (!file.contains(newFunctionName + "(")) {
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
        if (!file.contains(newImport + ";")) {
            const newImportInput = ["import " + newImport + ";"];

            const newContent = file.content.split("\n").slice(0, 2)
                .concat(newImportInput
                    .concat(file.content.split("\n").slice(2)))
                .reduce((a, b) => a + "\n" + b);

            file.setContent(newContent);
        }
    }

<<<<<<< HEAD
    public addToConstructor(file: File, targetClassName: string, inputClassName: string, inputArgument: string) {
        if (!file.contains(inputClassName)) {
            this.addMemberToClass(file, "private final " + inputClassName + " " + inputArgument);
            this.addConstructorArgument(file, targetClassName, inputClassName + " " + inputArgument);
            this.addConstructorAssignment(file, inputArgument);
=======
    public addToConstructor(file: File, className: string, argument: string) {
        if (!file.contains(this.lowercaseFirst(argument) + ";")) {
            this.addMemberToClass(file, "private final " + argument + " " + this.lowercaseFirst(argument));
            this.addConstructorArgument(file, className, argument + " " + this.lowercaseFirst(argument));
            this.addConstructorAssignment(file, argument);
>>>>>>> e607361be03e877399aa279e611815ec37ebd38d
        }
    }

    public extendClass(file: File, childClassName: string, parentClassName: string) {
        const extendLiteral = "extends";
        if (!file.contains(extendLiteral)) {
            file.replace("class " + childClassName, "class " + childClassName + " extends " + parentClassName);
        } else {
            console.error("Class already extends anther class!");
        }
    }

    private addMemberToClass(file: File, member: string) {
        const memberInputHook = "// @FieldInput";
        const argumentReplacement = member + ";\n    " + memberInputHook;

        file.replace(memberInputHook, argumentReplacement);
    }

    private addConstructorArgument(file: File, className: string, argument: string) {
        const constructorInputHook = className + "(";
        const argumentReplacement = constructorInputHook + argument + ", ";

        file.replace(constructorInputHook, argumentReplacement);
    }

    private addConstructorAssignment(file: File, argumentName: string) {
        const constructorInputHook = "// @ConstructorInput";
        const argumentReplacement = "this." + argumentName + " = " + argumentName + ";\n        " + constructorInputHook;

        file.replace(constructorInputHook, argumentReplacement);
    }

    public capitalize(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    public lowercaseFirst(word: string) {
        return word.charAt(0).toLowerCase() + word.slice(1);
    }

    public methodPrefix(type: string) {
        return type === "boolean" ? "is" : "get";
    }

    public box(javaType: string) {
        let boxedType: string;
        switch (javaType) {
            case "int":
                boxedType = "Integer";
                break;
            case "long":
                boxedType = "Long";
                break;
            case "boolean":
                boxedType = "Boolean";
                break;
            default:
                boxedType = javaType;
                break;
        }

        return boxedType;
    }

    public showingOrAbsent(input: string): boolean {
        return input === "showing";
    }

    public trueOfFalse(input: string): boolean {
        return input === "true";
    }
}

export const javaFunctions = new JavaClassFunctions();
