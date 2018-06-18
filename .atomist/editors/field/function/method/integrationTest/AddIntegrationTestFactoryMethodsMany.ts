import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";


export class AddIntegrationTestFactoryMethodsMany extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private biDirectional: boolean, private otherSideMany: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        const pathFactory = params.apiModule + "/src/main/test/java/integration/IntegrationTestFactory.java";
        if (project.fileExists(pathFactory)) {
            const file: File = project.findFile(pathFactory);

                if (this.biDirectional) {
                    this.addFactoryMethodManySideBi(file);
                } else {
                    this.addFactoryMethodManySideUni(file);
                }

            if (this.biDirectional) {
                javaFunctions.addImport(file, "java.util.HashSet");
            }
            if (this.otherSideMany) {
                javaFunctions.addImport(file, "java.util.Collections");
            }
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
        } else {
            console.error("Integration test factory class not added yet!");
        }
    }

    private addFactoryMethodManySideBi(file: File): void {

        const getOtherSide = this.otherSideMany ?
            `${this.otherClass.toLowerCase()}Set(Collections.singleton(${this.otherClass.toLowerCase()}))` :
            `${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})`;

        const rawJavaMethod = `
   public static ${this.oneClass} givenA${this.oneClass}With${this.otherClass}(${this.oneClass}Repository ` +
            `${this.oneClass.toLowerCase()}Repository, ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository) {
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder()
            .${this.oneClass.toLowerCase()}Set(new HashSet<>())
            .build());

        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
                .${getOtherSide}
                // @FieldInput
                .build());
        
        ${this.otherClass.toLowerCase()}.get${this.oneClass}Set().add(${this.oneClass.toLowerCase()});
        return ${this.oneClass.toLowerCase()};
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }

    private addFactoryMethodManySideUni(file: File): void {

        const getOtherSide = this.otherSideMany ?
            `${this.otherClass.toLowerCase()}Set(Collections.singleton(${this.otherClass.toLowerCase()}))` :
            `${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})`;

        const rawJavaMethod = `
   public static ${this.oneClass} givenA${this.oneClass}With${this.otherClass}(${this.oneClass}Repository ` +
            `${this.oneClass.toLowerCase()}Repository, ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository) {
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder().build());

        return ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
                .${getOtherSide}
                // @FieldInput
                .build());
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }
}
