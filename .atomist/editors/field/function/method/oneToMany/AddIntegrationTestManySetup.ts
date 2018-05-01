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

        const path = params.apiModule + "/src/test/java/integration/" + this.oneClass + "ResourceIT.java";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);

            this.addRepositoryOtherSide(file);
            this.addCleanUpList(file);
            this.deleteCleanUpListInTearDown(file);

            if (this.oneSide) {
                this.addFactoryMethodOneSide(file);
            } else {
                this.addFactoryMethodManySide(file);
            }

            javaFunctions.addImport(file, "java.util.ArrayList");
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

    private addCleanUpList(file: File): void {
        const rawJavaMethod = `
    private Set<${this.otherClass}> cleanUpList${this.otherClass} = new HashSet<>();`;

        if (!file.contains(`cleanUpList${this.otherClass}`)) {
            const functionInput = "// @InjectInput";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }

    private deleteCleanUpListInTearDown(file: File): void {
        const rawJavaMethod = `
    cleanUpList${this.otherClass}.stream().forEach(${this.otherClass.toLowerCase()}Repository::delete);`;

        if (!file.contains(`${this.otherClass.toLowerCase()}Repository::delete`)) {

            if (this.oneSide) {
                const functionInput = "// @TearDownInputTop";
                file.replace(functionInput, functionInput + "\n      " + rawJavaMethod);
            } else {
                const functionInput = "// @TearDownInputBottom";
                file.replace(functionInput, rawJavaMethod + "\n     " + functionInput);
            }
        }
    }

    private addFactoryMethodOneSide(file: File): void {
        const rawJavaMethod = `
   private ${this.oneClass} givenA${this.oneClass}With${this.otherClass}() {
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
            .${this.otherClass.toLowerCase()}List(new ArrayList<>())
            .build());
        cleanUpList${this.oneClass}.add(${this.oneClass.toLowerCase()});

        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder()
                .${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()})
                // @FieldInput
                .build());
        cleanUpListCar.add(${this.otherClass.toLowerCase()});

        ${this.oneClass.toLowerCase()}.get${this.otherClass}List().add(${this.otherClass.toLowerCase()});
        return ${this.oneClass.toLowerCase()};
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}s(`)) {
            const functionInput = "// @PrivateMethodInput";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }

    private addFactoryMethodManySide(file: File): void {
        const rawJavaMethod = `
   private ${this.oneClass} givenA${this.oneClass}With${this.otherClass}() {
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder()
            .${this.oneClass.toLowerCase()}List(new ArrayList<>())
            .build());
        cleanUpList${this.otherClass}.add(${this.otherClass.toLowerCase()});

        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
                .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})
                // @FieldInput
                .build());
        cleanUpListCar.add(${this.oneClass.toLowerCase()});
        
        ${this.otherClass.toLowerCase()}.get${this.oneClass}List().add(${this.oneClass.toLowerCase()});
        return ${this.oneClass.toLowerCase()};
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}s(`)) {
            const functionInput = "// @PrivateMethodInput";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }
}
