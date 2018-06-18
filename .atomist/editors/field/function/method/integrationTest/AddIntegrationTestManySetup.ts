import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";

export class AddIntegrationTestManySetup extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private oneSide: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        const pathIntegrationTests = params.apiModule + "/src/main/test/java/integration/" + this.oneClass + "ResourceIT.java";
        if (project.fileExists(pathIntegrationTests)) {
            const file: File = project.findFile(pathIntegrationTests);

            this.addRepositoryOtherSide(file);
            this.deleteInTearDown(file);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
        } else {
            console.error("Integration test class not added yet!");
        }
    }

    private addRepositoryOtherSide(file: File): void {
        const rawJavaMethod = `
    @Autowired
    private ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository;`;

        if (!file.contains(`${this.otherClass.toLowerCase()}Repository;`)) {
            const functionInput = "// @InjectInput";

            file.replace(functionInput, rawJavaMethod + "\n\n     " + functionInput);
        }
    }

    private deleteInTearDown(file: File): void {
        const rawJavaMethod = `
        ${this.otherClass.toLowerCase()}Repository.deleteAll();`;

        if (!file.contains(`${this.otherClass.toLowerCase()}Repository.deleteAll();`)) {

            if (this.oneSide) {
                const functionInput = "// @TearDownInputTop";
                file.replace(functionInput, functionInput + "\n      " + rawJavaMethod);
            } else {
                const functionInput = "// @TearDownInputBottom";
                file.replace(functionInput, rawJavaMethod + "\n     " + functionInput);
            }
        }
    }
}
