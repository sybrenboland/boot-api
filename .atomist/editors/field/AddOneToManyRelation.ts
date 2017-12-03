import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {fileFunctions} from "../functions/FileFunctions";
import {javaFunctions} from "../functions/JavaClassFunctions";
import {addOneToManyRelationOneSide} from "./AddOneToManyRelationOneSide";
import {addOneToManyRelationManySide} from "./AddOneToManyRelationManySide";
import {addOneToManyPut} from "./AddOneToManyPut";
import {addOneToManyDelete} from "./AddOneToManyDelete";
import {addManyToManyDelete} from "./AddManyToManyDelete";
import {addManyToManyPut} from "./AddManyToManyPut";

/**
 * AddOneToManyRelation editor
 * - Adds one-many relation on the database objects
 * - Adds one-many relation on the hibernate beans (bi-directional or uni-directional)
 * - Adds hateoas links to the converters
 * - Adds PUT and/or DELETE resources for the relationship (as object)
 */
@Editor("AddOneToManyRelation", "Adds a one-many relation between two objects")
@Tags("rug", "api", "persistence", "domain", "shboland", "hibernate", "OneToMany")
export class AddOneToManyRelation implements EditProject {
    @Parameter({
        displayName: "Class name 'one'",
        description: "Name of the class on the one side",
        pattern: Pattern.java_class,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public classNameOne: string;

    @Parameter({
        displayName: "Show in output one side",
        description: "Do you want the one side to show in the output?",
        pattern: Pattern.any,
        validInput: "true or false",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public showInOutputOne: string = "true";

    @Parameter({
        displayName: "Class name 'many'",
        description: "Name of the class on the many side",
        pattern: Pattern.java_class,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public classNameMany: string;

    @Parameter({
        displayName: "Show in output many side",
        description: "Do you want the many side to show in the output?",
        pattern: Pattern.any,
        validInput: "true or false",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public showInOutputMany: string = "true";

    @Parameter({
        displayName: "Di-directional relation",
        description: "Is the relation bi-directional? (Do we want many-list in the one-object?",
        pattern: Pattern.any,
        validInput: "true or false",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public biDirectional: string = "true";

    @Parameter({
        displayName: "Base package name",
        description: "Name of the base package in witch we want to add",
        pattern: Pattern.java_package,
        validInput: "Java package name",
        minLength: 0,
        maxLength: 100,
        required: true,
    })
    public basePackage: string;

    @Parameter({
        displayName: "Methods",
        description: "All methods you want implemented for the one side (PUT,DELETE)",
        pattern: Pattern.any,
        validInput: "Comma separated http methods e.g. 'PUT,DELETE'",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public methodsOneSide: string = "PUT,DELETE";

    @Parameter({
        displayName: "Methods",
        description: "All methods you want implemented for the many side (PUT,DELETE)",
        pattern: Pattern.any,
        validInput: "Comma separated http methods e.g. 'PUT,DELETE'",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public methodsManySide: string = "PUT,DELETE";

    @Parameter({
        displayName: "Module name",
        description: "Name of the persistence module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public persistenceModule: string = "persistence";

    @Parameter({
        displayName: "Module name",
        description: "Name of the api module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "api";

    @Parameter({
        displayName: "Module name",
        description: "Name of the domain module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public domainModule: string = "domain";

    @Parameter({
        displayName: "Release",
        description: "Release for with database changes are meant",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public release: string = "1.0.0";


    public edit(project: Project) {

        const basePath = "/src/main/java/" + fileFunctions.toPath(this.basePackage);

        AddOneToManyRelation.extendChangeSetOtherSide(project, this.classNameMany, this.classNameOne,
            this.persistenceModule, this.release);
        AddOneToManyRelation.addChangeSetForeignKey(project, this.classNameMany, this.classNameOne + "_id",
            this.classNameOne, this.persistenceModule, this.release);
        this.extendBeanClassManySide(project, basePath);
        this.addMethodsManySide(project, basePath);

        if (javaFunctions.trueOfFalse(this.biDirectional)) {
            this.extendBeanClassOneSide(project, basePath);
            this.addMethodsOneSide(project, basePath);
        }

        if (javaFunctions.trueOfFalse(this.showInOutputOne)) {
            addOneToManyRelationOneSide.edit(project, basePath, this.classNameOne, this.classNameMany,
                this.basePackage, this.persistenceModule, this.apiModule);
        }
        if (javaFunctions.trueOfFalse(this.showInOutputMany)) {
            addOneToManyRelationManySide.edit(project, basePath, this.classNameOne, this.classNameMany,
                this.basePackage, this.apiModule, true, true);
        }
    }

    public static extendChangeSetOtherSide(project: Project, classNameOther: string, classNameMapping: string,
                                           persistenceModuleInput: string, releaseInput: string) {
        const inputHook = "<!-- @Input -->";
        const rawChangeSetColumn = `<changeSet id="add_${classNameMapping.toLowerCase()}_` +
            `id_${classNameOther.toLowerCase()}" author="shboland">
    <addColumn tableName="${classNameOther.toUpperCase()}">
      <column name="${classNameMapping.toUpperCase()}_ID" type="int" />
    </addColumn>
  </changeSet>
  
  ` + inputHook;

        const path = persistenceModuleInput + "/src/main/resources/liquibase/release/"
            + releaseInput + "/db-1-" + classNameOther.toLowerCase() + ".xml";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangeSetColumn);
        } else {
            console.error("Changset not added yet!");
        }
    }

    public static addChangeSetForeignKey(project: Project, baseClassName: string, baseColumn: string,
                                         otherClassName: string, persistenceModuleInput: string, releaseInput: string) {

        const rawChangeSet = `<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.4.xsd">

    <changeSet id="add_foreignkey_${otherClassName.toLowerCase()}_${baseClassName.toLowerCase()}" author="shboland" >
        <addForeignKeyConstraint baseColumnNames="${baseColumn.toUpperCase()}"
                                 baseTableName="${baseClassName.toUpperCase()}"
                                 constraintName="FK_${otherClassName.toUpperCase()}_${baseClassName.toUpperCase()}"
                                 referencedColumnNames="ID"
                                 referencedTableName="${otherClassName.toUpperCase()}"/>
    </changeSet>
</databaseChangeLog>`;

        const pathChangeset = persistenceModuleInput + "/src/main/resources/liquibase/release/" + releaseInput + "/db-2-"
            + otherClassName.toLowerCase() + "-" + baseClassName.toLowerCase() + ".xml";

        if (!project.fileExists(pathChangeset)) {
            project.addFile(pathChangeset, rawChangeSet);
        }
    }

    private extendBeanClassOneSide(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "${this.classNameOne.toLowerCase()}")
    private List<${this.classNameMany}> ${this.classNameMany.toLowerCase()}List;
    
    ` + inputHook;

        const rawJavaMethods = inputHook +
            `
            
    public void add${this.classNameMany}(${this.classNameMany} ${this.classNameMany.toLowerCase()}) {
        ${this.classNameMany.toLowerCase()}List.add(${this.classNameMany.toLowerCase()});
        ${this.classNameMany.toLowerCase()}.set${this.classNameOne}(this);
    }

    public void remove${this.classNameMany}(${this.classNameMany} ${this.classNameMany.toLowerCase()}) {
        ${this.classNameMany.toLowerCase()}List.remove(${this.classNameMany.toLowerCase()});
        ${this.classNameMany.toLowerCase()}.set${this.classNameOne}(null);
    }`;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.classNameOne + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
            beanFile.replace(inputHook, rawJavaMethods);
            javaFunctions.addImport(beanFile, "java.util.List");
            javaFunctions.addImport(beanFile, "lombok.AccessLevel");
        } else {
            console.error("Bean class one side not added yet!");
        }
    }

    private extendBeanClassManySide(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="${this.classNameOne.toLowerCase()}_id")
    private ${this.classNameOne} ${this.classNameOne.toLowerCase()};
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.classNameMany + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class many side not added yet!");
        }
    }

    private addMethodsOneSide(project: Project, basePath: string) {

        this.methodsOneSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    addOneToManyPut.addMethodResourceInterface(project, basePath, this.classNameOne, this.classNameMany, this.apiModule);
                    addOneToManyPut.addMethodResourceClass(project, basePath, this.classNameOne, this.classNameMany, this.apiModule);
                    addOneToManyPut.addMethodServiceOneSide(project, basePath, this.classNameOne, this.classNameMany, this.basePackage, this.apiModule);
                    break;
                }
                case "DELETE": {
                    addOneToManyDelete.addMethodResourceInterface(project, basePath, this.classNameOne, this.classNameMany, this.apiModule);
                    addOneToManyDelete.addMethodResourceClass(project, basePath, this.classNameOne, this.classNameMany, this.apiModule);
                    addOneToManyDelete.addMethodServiceOneSide(project, basePath, this.classNameOne, this.classNameMany, this.basePackage, this.apiModule);
                    break;
                }
            }
        });
    }

    private addMethodsManySide(project: Project, basePath: string) {

        this.methodsManySide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    addOneToManyPut.addMethodResourceInterface(project, basePath, this.classNameMany, this.classNameOne, this.apiModule);
                    addOneToManyPut.addMethodResourceClass(project, basePath, this.classNameMany, this.classNameOne, this.apiModule);
                    addOneToManyPut.addMethodServiceManySide(project, basePath, this.classNameOne, this.classNameMany, this.basePackage, this.apiModule);
                    break;
                }
                case "DELETE": {
                    addOneToManyDelete.addMethodResourceInterface(project, basePath, this.classNameMany, this.classNameOne, this.apiModule);
                    addOneToManyDelete.addMethodResourceClass(project, basePath, this.classNameMany, this.classNameOne, this.apiModule);
                    addOneToManyDelete.addMethodServiceManySide(project, basePath, this.classNameOne, this.classNameMany, this.basePackage, this.apiModule);
                    break;
                }
            }
        });
    }
}

export const addOneToManyRelation = new AddOneToManyRelation();
