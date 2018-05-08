import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";


export class AddIntegrationTestManySetup extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private oneSide: boolean, private biDirectional: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        const pathIntegrationTests = params.apiModule + "/src/test/java/integration/" + this.oneClass + "ResourceIT.java";
        if (project.fileExists(pathIntegrationTests)) {
            const file: File = project.findFile(pathIntegrationTests);

            this.addRepositoryOtherSide(file);
            this.addCleanUpList(file);
            this.deleteCleanUpListInTearDown(file);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
        } else {
            console.error("Integration test class not added yet!");
        }

        const pathFactory = params.apiModule + "/src/test/java/integration/IntegrationTestFactory.java";
        if (project.fileExists(pathFactory)) {
            const file: File = project.findFile(pathFactory);

            if (this.oneSide) {
                if (this.biDirectional) {
                    this.addFactoryMethodOneSide(file);
                }
            } else {
                if (this.biDirectional) {
                    this.addFactoryMethodManySideBi(file);
                } else {
                    this.addFactoryMethodManySideUni(file);
                }
            }

            if (this.biDirectional) {
                javaFunctions.addImport(file, "java.util.ArrayList");
            }
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.repo." + this.otherClass + "Repository");
        } else {
            console.error("Integration test factory class not added yet!");
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
    private Set<Long> cleanUpList${this.otherClass} = new HashSet<>();`;

        if (!file.contains(`cleanUpList${this.otherClass} = new HashSet<>();`)) {
            const functionInput = "// @InjectInput";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }

    private deleteCleanUpListInTearDown(file: File): void {
        const rawJavaMethod = `
        cleanUpList${this.otherClass}.stream().forEach(${this.otherClass.toLowerCase()}Repository::deleteById);`;

        if (!file.contains(`${this.otherClass.toLowerCase()}Repository::deleteById`)) {

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
   public static ${this.oneClass} givenA${this.oneClass}With${this.otherClass}(${this.oneClass}Repository ` +
            `${this.oneClass.toLowerCase()}Repository, ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository) {
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
            .${this.otherClass.toLowerCase()}List(new ArrayList<>())
            .build());

        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder()
                .${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()})
                // @FieldInput
                .build());

        ${this.oneClass.toLowerCase()}.get${this.otherClass}List().add(${this.otherClass.toLowerCase()});
        return ${this.oneClass.toLowerCase()};
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}s(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }

    private addFactoryMethodManySideBi(file: File): void {

        const rawJavaMethod = `
   public static ${this.oneClass} givenA${this.oneClass}With${this.otherClass}(${this.oneClass}Repository ` +
            `${this.oneClass.toLowerCase()}Repository, ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository) {
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder()
            .${this.oneClass.toLowerCase()}List(new ArrayList<>())
            .build());

        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
                .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})
                // @FieldInput
                .build());
        
        ${this.otherClass.toLowerCase()}.get${this.oneClass}List().add(${this.oneClass.toLowerCase()});
        return ${this.oneClass.toLowerCase()};
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}s(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }

    private addFactoryMethodManySideUni(file: File): void {

        const rawJavaMethod = `
   public static ${this.oneClass} givenA${this.oneClass}With${this.otherClass}(${this.oneClass}Repository ` +
            `${this.oneClass.toLowerCase()}Repository, ${this.otherClass}Repository ${this.otherClass.toLowerCase()}Repository) {
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.otherClass.toLowerCase()}Repository.save(${this.otherClass}.builder().build());

        return ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder()
                .${this.otherClass.toLowerCase()}(${this.otherClass.toLowerCase()})
                // @FieldInput
                .build());
    }`;

        if (!file.contains(`givenA${this.oneClass}With${this.otherClass}s(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawJavaMethod);
        }
    }
}
