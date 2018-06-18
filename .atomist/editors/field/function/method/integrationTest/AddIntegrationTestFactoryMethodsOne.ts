import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";


export class AddIntegrationTestFactoryMethodsOne extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private mappingSide: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        const pathFactory = params.apiModule + "/src/main/test/java/integration/IntegrationTestFactory.java";
        if (project.fileExists(pathFactory)) {
            const file: File = project.findFile(pathFactory);

            if (this.mappingSide) {
                this.addFactoryMethodMappingSide(file);
            } else {
                this.addFactoryMethodOtherSide(file);
            }

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
        } else {
            console.error("Integration test factory class not added yet!");
        }
    }

    private addFactoryMethodMappingSide(file: File): void {

        const rawJavaMethod = `
   public static ${this.oneClass} givenA${this.oneClass}With${this.otherClass}(` +
            `${this.oneClass}Repository ${this.oneClass.toLowerCase()}Repository, ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository) {
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
            .build());

        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder()
                .${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()})
                // @FieldInput
                .build());

        return ${this.oneClass.toLowerCase()}.toBuilder()
                .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})
                .build();
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }

    private addFactoryMethodOtherSide(file: File): void {

        const rawJavaMethod = `
   public static ${this.oneClass} givenA${this.oneClass}With${this.otherClass}(` +
            `${this.oneClass}Repository ${this.oneClass.toLowerCase()}Repository, ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository) {
       ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder()
               .build());

       ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
               .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})
               // @FieldInput
               .build());

       return ${this.oneClass.toLowerCase()};
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }
}
