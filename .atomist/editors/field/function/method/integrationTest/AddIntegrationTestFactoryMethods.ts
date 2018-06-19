import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";


export class AddIntegrationTestFactoryMethods extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private biDirectional: boolean, private otherSideMany: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        const pathFactory = params.apiModule + "/src/test/java/integration/IntegrationTestFactory.java";
        if (project.fileExists(pathFactory)) {
            const file: File = project.findFile(pathFactory);

            if (this.biDirectional) {
                this.addFactoryMethodOneSide(file);

                if (this.otherSideMany) {
                    javaFunctions.addImport(file, "java.util.Collections");
                }
                javaFunctions.addImport(file, "java.util.HashSet");
                javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
                javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
                javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
            }
        } else {
            console.error("Integration test factory class not added yet!");
        }
    }

    private addFactoryMethodOneSide(file: File): void {

        const getOtherSide = this.otherSideMany ?
            `${this.oneClass.toLowerCase()}Set(Collections.singleton(${this.oneClass.toLowerCase()}))` :
            `${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()})`;

        const rawJavaMethod = `
   public static ${this.oneClass} givenA${this.oneClass}With${this.otherClass}(${this.oneClass}Repository ` +
            `${this.oneClass.toLowerCase()}Repository, ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository) {
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
            .${this.otherClass.toLowerCase()}Set(new HashSet<>())
            .build());

        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder()
                .${getOtherSide}
                // @FieldInput
                .build());

        ${this.oneClass.toLowerCase()}.get${this.otherClass}Set().add(${this.otherClass.toLowerCase()});
        return ${this.oneClass.toLowerCase()};
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }
}
