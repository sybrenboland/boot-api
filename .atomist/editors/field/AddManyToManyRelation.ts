import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {fileFunctions} from "../functions/FileFunctions";
import {javaFunctions} from "../functions/JavaClassFunctions";
import {addOneToManyRelationOneSide} from "./AddOneToManyRelationOneSide";
import {addOneToManyPut} from "./AddOneToManyPut";
import {addOneToManyDelete} from "./AddOneToManyDelete";
import {AddOneToManyRelation} from "./AddOneToManyRelation";

/**
 * AddManyToManyRelation editor
 * - Adds many-many relation on the database objects (mapped by one of the objects)
 * - Adds many-many relation on the hibernate beans (mapped by one of the objects)
 * - Adds hateoas links to the converters
 * - Adds PUT and/or DELETE resources for the relationship (as object)
 */
@Editor("AddManyToManyRelation", "Adds a many-many relation between two objects")
@Tags("rug", "api", "persistence", "shboland", "hibernate", "ManyToMany")
export class AddManyToManyRelation implements EditProject {
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

        this.addCombinationTableChangeSet(project);
        AddOneToManyRelation.addChangeSetForeignKey(project, this.classNameMappedBy,
            this.classNameMappedBy + "_" + this.classNameOther,
            this.persistenceModule,
            this.release);
        AddOneToManyRelation.addChangeSetForeignKey(project, this.classNameOther,
            this.classNameMappedBy + "_" + this.classNameOther,
            this.persistenceModule,
            this.release);

        this.extendBeanClassMappingSide(project, basePath);
        this.extendBeanClassOtherSide(project, basePath);

        if (javaFunctions.trueOfFalse(this.showInOutputMapped)) {
             addOneToManyRelationOneSide.edit(project, basePath, this.classNameMappedBy, this.classNameOther,
                 this.basePackage, this.persistenceModule, this.apiModule);
        }
        if (javaFunctions.trueOfFalse(this.showInOutputOther)) {
            addOneToManyRelationOneSide.edit(project, basePath, this.classNameOther, this.classNameMappedBy,
                this.basePackage, this.persistenceModule, this.apiModule);
        }

        this.addMethodsMappingSide(project, basePath, isBiDirectional);
        this.addMethodsOtherSide(project, basePath, isBiDirectional);
    }

    private addCombinationTableChangeSet(project: Project) {
        const rawChangeSet = `<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.4.xsd">
 
  <changeSet id="create_${this.classNameMappedBy.toLowerCase()}_${this.classNameOther.toLowerCase()}" author="shboland">
    <createTable tableName="${this.classNameMappedBy.toUpperCase()}_${this.classNameOther.toUpperCase()}">
      <column name="${this.classNameMappedBy.toLowerCase()}_id" type="int" >
        <constraints nullable="false" />
      </column>
      <column name="${this.classNameOther.toLowerCase()}_id" type="int" >
        <constraints nullable="false" />
      </column>
    </createTable>
  </changeSet>

</databaseChangeLog>
`;

        const path = this.persistenceModule + "/src/main/resources/liquibase/release/" + this.release + "/db-1-"
            + this.classNameMappedBy.toLowerCase() + "-" + this.classNameOther.toLowerCase() + ".xml";

        if (!project.fileExists(path)) {
            project.addFile(path, rawChangeSet);
        }

    }

    private extendBeanClassMappingSide(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@ManyToMany(mappedBy = "${this.classNameMappedBy.toLowerCase()}Set")
    private Set<${this.classNameOther}> ${this.classNameOther.toLowerCase()}Set = new HashSet<>();
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.classNameMappedBy + ".java";
        const file: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            file.replace(inputHook, rawJavaCode);
            javaFunctions.addImport(file, "java.util.Set");
            javaFunctions.addImport(file, "java.util.HashSet");
        } else {
            console.error("Bean class mapping side not added yet!");
        }
    }

    private extendBeanClassOtherSide(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@ManyToMany
    @JoinTable(name = "${this.classNameMappedBy.toLowerCase()}_${this.classNameOther.toLowerCase()}",
            joinColumns = @JoinColumn(name = "${this.classNameOther.toLowerCase()}_id"),
            inverseJoinColumns = @JoinColumn(name = "${this.classNameMappedBy.toLowerCase()}_id")
    )
    private Set<${this.classNameMappedBy}> ${this.classNameMappedBy.toLowerCase()}Set = new HashSet<>();
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.classNameOther + ".java";
        const file: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            file.replace(inputHook, rawJavaCode);
            javaFunctions.addImport(file, "java.util.Set");
            javaFunctions.addImport(file, "java.util.HashSet");
            javaFunctions.addImport(file, "javax.persistence.ManyToMany");
            javaFunctions.addImport(file, "javax.persistence.JoinColumn");
            javaFunctions.addImport(file, "javax.persistence.JoinTable");
        } else {
            console.error("Bean class other side not added yet!");
        }
    }

    private addMethodsMappingSide(project: Project, basePath: string, isBiDirectional: boolean) {

        this.methodsMappingSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    addOneToManyPut.addMethodResourceInterface(project, basePath, this.classNameMappedBy, this.classNameOther, this.apiModule);
                    addOneToManyPut.addMethodResourceClass(project, basePath, this.classNameMappedBy, this.classNameOther, this.apiModule);
                    addOneToManyPut.addMethodServiceOneSide(project, basePath, this.classNameMappedBy, this.classNameOther, this.basePackage, this.apiModule);
                    break;
                }
                case "DELETE": {
                    addOneToManyDelete.addMethodResourceInterface(project, basePath, this.classNameMappedBy, this.classNameOther, this.apiModule);
                    addOneToManyDelete.addMethodResourceClass(project, basePath, this.classNameMappedBy, this.classNameOther, this.apiModule);
                    addOneToManyDelete.addMethodServiceOneSide(project, basePath, this.classNameMappedBy, this.classNameOther, this.basePackage, this.apiModule);
                    break;
                }
            }
        });
    }

    private addMethodsOtherSide(project: Project, basePath: string, isBiDirectional: boolean) {

        this.methodsOtherSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    addOneToManyPut.addMethodResourceInterface(project, basePath, this.classNameOther, this.classNameMappedBy, this.apiModule);
                    addOneToManyPut.addMethodResourceClass(project, basePath, this.classNameOther, this.classNameMappedBy, this.apiModule);
                    addOneToManyPut.addMethodServiceManySide(project, basePath, this.classNameMappedBy, this.classNameOther, this.basePackage, this.apiModule);
                    break;
                }
                case "DELETE": {
                    addOneToManyDelete.addMethodResourceInterface(project, basePath, this.classNameOther, this.classNameMappedBy, this.apiModule);
                    addOneToManyDelete.addMethodResourceClass(project, basePath, this.classNameOther, this.classNameMappedBy, this.apiModule);
                    addOneToManyDelete.addMethodServiceManySide(project, basePath, this.classNameMappedBy   , this.classNameOther, this.basePackage, this.apiModule);
                    break;
                }
            }
        });
    }
}

export const addManyToManyRelation = new AddManyToManyRelation();
