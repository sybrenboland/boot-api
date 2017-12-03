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
import {AddOneToManyRelation, addOneToManyRelation} from "./AddOneToManyRelation";
import {addOneToOnePut} from "./AddOneToOnePut";
import {addOneToOneDelete} from "./AddOneToOneDelete";

/**
 * AddOneToOneRelation editor
 * - Adds one-one relation on the database objects (mapped by one of the objects)
 * - Adds one-one relation on the hibernate beans (mapped by one of the objects)
 * - Adds hateoas links to the converters
 * - Adds PUT and/or DELETE resources for the relationship (as object)
 */
@Editor("AddOneToOneRelation", "Adds a one-one relation between two objects")
@Tags("rug", "api", "persistence", "domain", "shboland", "hibernate", "OneToOne")
export class AddOneToOneRelation implements EditProject {
    @Parameter({
        displayName: "Class name that maps the relation",
        description: "Name of the class on the side that maps the relation",
        pattern: Pattern.java_class,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public classNameMappedBy: string;

    @Parameter({
        displayName: "Show in output mapped side",
        description: "Do you want the mapping side to show in the output?",
        pattern: Pattern.any,
        validInput: "true or false",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public showInOutputMapped: string = "true";

    @Parameter({
        displayName: "Class name 'other'",
        description: "Name of the class on the other side",
        pattern: Pattern.java_class,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public classNameOther: string;

    @Parameter({
        displayName: "Show in output other side",
        description: "Do you want the other side to show in the output?",
        pattern: Pattern.any,
        validInput: "true or false",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public showInOutputOther: string = "true";

    @Parameter({
        displayName: "Di-directional relation",
        description: "Is the relation bi-directional on bean level? (Can the related object exist without the other?)",
        pattern: Pattern.any,
        validInput: "true or false",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public biDirectional: string = "false";

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
        description: "All methods you want implemented for the mapping side (PUT,DELETE)",
        pattern: Pattern.any,
        validInput: "Comma separated http methods e.g. 'PUT,DELETE'",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public methodsMappingSide: string = "PUT,DELETE";

    @Parameter({
        displayName: "Methods",
        description: "All methods you want implemented for the other side (PUT,DELETE)",
        pattern: Pattern.any,
        validInput: "Comma separated http methods e.g. 'PUT,DELETE'",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public methodsOtherSide: string = "PUT,DELETE";

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
        const isBiDirectional = javaFunctions.trueOfFalse(this.biDirectional);

        if (isBiDirectional) {
            AddOneToManyRelation.extendChangeSetOtherSide(project, this.classNameOther, this.classNameMappedBy,
                this.persistenceModule, this.release);
            AddOneToManyRelation.addChangeSetForeignKey(project, this.classNameOther, this.classNameMappedBy + "_id",
                this.classNameMappedBy, this.persistenceModule, this.release);

            this.extendBeanClassOtherSideBiDirectional(project, basePath);
            this.extendBeanClassMappedBySide(project, basePath);

        } else {
            this.extendChangeSet(project);
            AddOneToManyRelation.addChangeSetForeignKey(project, this.classNameOther, this.classNameMappedBy + "_id",
                this.classNameMappedBy, this.persistenceModule, this.release);
            this.extendBeanClassOtherSide(project, basePath);
        }

        if (javaFunctions.trueOfFalse(this.showInOutputMapped)) {
            addOneToManyRelationManySide.edit(project, basePath, this.classNameOther, this.classNameMappedBy,
                this.basePackage, this.apiModule, isBiDirectional, false);
        }
        if (javaFunctions.trueOfFalse(this.showInOutputOther)) {
            addOneToManyRelationManySide.edit(project, basePath, this.classNameMappedBy, this.classNameOther,
                this.basePackage, this.apiModule, true, false);
        }

        this.addMethodsMappingSide(project, basePath, isBiDirectional);
        this.addMethodsOtherSide(project, basePath, isBiDirectional);
    }

    private extendChangeSet(project: Project) {
        const inputHook = "<!-- @Input -->";
        const rawChangeSetColumn = `<changeSet id="change_id_${this.classNameOther.toLowerCase()}" author="shboland">
    <renameColumn tableName="${this.classNameOther.toUpperCase()}" oldColumnName="id" ` +
            `newColumnName="${this.classNameMappedBy.toLowerCase()}_id" />
  </changeSet>
  
  ` + inputHook;

        const path = this.persistenceModule + "/src/main/resources/liquibase/release/"
            + this.release + "/db-1-" + this.classNameOther.toLowerCase() + ".xml";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangeSetColumn);
        } else {
            console.error("Changset not added yet!");
        }
    }

    private extendBeanClassOtherSide(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@OneToOne(fetch = FetchType.LAZY)
    @MapsId
    private ${this.classNameMappedBy} ${this.classNameMappedBy.toLowerCase()};
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.classNameOther + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class many side not added yet!");
        }
    }

    private extendBeanClassOtherSideBiDirectional(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "${this.classNameMappedBy.toLowerCase()}_id")
    private ${this.classNameMappedBy} ${this.classNameMappedBy.toLowerCase()};
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.classNameOther + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class many side not added yet!");
        }
    }

    private extendBeanClassMappedBySide(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@OneToOne(mappedBy = "${this.classNameMappedBy.toLowerCase()}")
    private ${this.classNameOther} ${this.classNameOther.toLowerCase()};
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.classNameMappedBy + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class one side not added yet!");
        }
    }

    private addMethodsMappingSide(project: Project, basePath: string, isBiDirectional: boolean) {

        this.methodsMappingSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    addOneToOnePut.addPutBiDirectional(project, basePath, this.classNameMappedBy, this.classNameOther, this.basePackage, this.apiModule);
                    break;
                }
                case "DELETE": {
                    if (isBiDirectional) {
                        addOneToOneDelete.addDeleteBiDirectional(project, basePath, this.classNameMappedBy, this.classNameOther, this.basePackage, this.apiModule);
                    } else {
                        addOneToOneDelete.addDeleteUniDirectional(project, basePath, this.classNameMappedBy, this.classNameOther, this.basePackage, this.apiModule);
                    }
                    break;
                }
            }
        });
    }

    private addMethodsOtherSide(project: Project, basePath: string, isBiDirectional: boolean) {

        this.methodsOtherSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    if (isBiDirectional) {
                        addOneToOnePut.addPutBiDirectional(project, basePath, this.classNameOther, this.classNameMappedBy, this.basePackage, this.apiModule);
                        addOneToOnePut.overrideSetter(project, basePath, this.classNameMappedBy, this.classNameOther, this.persistenceModule);
                    } else {
                        addOneToOnePut.addPutUniDirectional(project, basePath, this.classNameOther, this.classNameMappedBy, this.basePackage, this.apiModule);
                    }
                    break;
                }
                case "DELETE": {
                    if (isBiDirectional) {
                        addOneToOneDelete.addDeleteBiDirectional(project, basePath, this.classNameOther, this.classNameMappedBy, this.basePackage, this.apiModule);
                    }
                    break;
                }
            }
        });
    }
}

export const addOneToOneRelation = new AddOneToOneRelation();
