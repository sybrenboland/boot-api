import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {fileFunctions} from "../functions/FileFunctions";
import {dateFieldFunctions} from "./DateFieldFunctions";
import {javaFunctions} from "../functions/JavaClassFunctions";

/**
 * AddField editor
 * - Adds chain from persistence to api for field of a bean
 * - Supported types: String, int, long, boolean, LocalDateTime
 */
@Editor("AddField", "Add field to a bean for the whole api to persistence chain")
@Tags("rug", "api", "persistence", "domain", "shboland")
export class AddField implements EditProject {
    @Parameter({
        displayName: "Field name",
        description: "Name of the field we want to add",
        pattern: Pattern.java_identifier,
        validInput: "Java identifier",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public fieldName: string;

    @Parameter({
        displayName: "Type",
        description: "Type of the field we want to add",
        pattern: Pattern.any,
        validInput: "Java type that is supported: String, int, long, boolean, LocalDateTime",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public type: string;

    @Parameter({
        displayName: "Class name",
        description: "Name of the class we want to add",
        pattern: Pattern.java_class,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public className: string;

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

        this.addChangelog(project);

        if (this.type === "LocalDateTime") {
            dateFieldFunctions.addDateField(
                this.fieldName, this.type, this.className, this.basePackage,
                this.persistenceModule, this.apiModule, this.domainModule,
                project, basePath);
        } else {
            this.addFieldToBean(project, basePath);
            this.addFieldToDomainObject(project, basePath);
            this.addFieldToConverter(project, basePath);
            this.addFieldToJsonSearchCriteria(project, basePath);
            this.addFieldToSearchCriteria(project, basePath);
            this.addFieldToSearchCriteriaConverter(project, basePath);
            this.addFieldToPredicates(project, basePath);
        }
    }

    private addChangelog(project: Project) {
        const inputHook = "<!-- @Input -->";
        const rawChangSet = `<changeSet id="add_${this.fieldName}_${this.className.toLowerCase()}" author="shboland">
    <addColumn tableName="${this.className.toUpperCase()}">
      <column name="${this.fieldName.toUpperCase()}" type="${this.convertToDbType(this.type)}" />
    </addColumn>
  </changeSet>
  
  ` + inputHook;

        const path = this.persistenceModule + "/src/main/resources/liquibase/release/"
            + this.release + "/db-" + this.className.toLowerCase() + ".xml";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangSet);
        } else {
            console.error("Changset not added yet!");
        }
    }

    private addFieldToBean(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@Column(name = "${this.fieldName.toUpperCase()}")
    private ${this.type} ${this.fieldName};
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.className + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class not added yet!");
        }
    }

    private addFieldToDomainObject(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@JsonProperty("${this.fieldName}")
    private ${this.type} ${this.fieldName};

    ` + inputHook;

        const path = this.domainModule + basePath + "/domain/Json" + this.className + ".java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("Domain class not added yet!");
        }
    }

    private addFieldToConverter(project: Project, basePath: string) {
        const methodPrefix = this.type === "boolean" ? "is" : "get";

        const inputJsonHook = "// @InputJsonField";
        let rawJsonInput = `json${this.className}.set${javaFunctions.capitalize(this.fieldName)}` +
            `(${this.className.toLowerCase()}.${methodPrefix}${javaFunctions.capitalize(this.fieldName)}());
        ` + inputJsonHook;

        const inputBeanHook = "// @InputBeanField";
        let rawBeanInput = `${this.className.toLowerCase()}To.set${javaFunctions.capitalize(this.fieldName)}` +
            `(${this.className.toLowerCase()}From.${methodPrefix}${javaFunctions.capitalize(this.fieldName)}());
        ` + inputBeanHook;

        const path = this.apiModule + basePath + "/convert/" + this.className + "Converter.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(inputJsonHook, rawJsonInput);
            file.replace(inputBeanHook, rawBeanInput);
        } else {
            console.error("Converter not added yet!");
        }
    }

    private addFieldToJsonSearchCriteria(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@QueryParam("${this.fieldName}")
    private ${this.type} ${this.fieldName};
    
    ` + inputHook;

        const path = this.domainModule + basePath + "/domain/Json" + this.className + "SearchCriteria.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("JsonSearchCriteria class not added yet!");
        }
    }

    private addFieldToSearchCriteria(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `private Optional<${this.type}> ${this.fieldName} = Optional.empty();
    
    ` + inputHook;

        const path = this.persistenceModule + basePath + "/domain/" + this.className + "SearchCriteria.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("SearchCriteria class not added yet!");
        }
    }

    private addFieldToSearchCriteriaConverter(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `${this.type} ${this.fieldName} = ` +
            `json${this.className}SearchCriteria.get${javaFunctions.capitalize(this.fieldName)}();
        sc.set${javaFunctions.capitalize(this.fieldName)}(Optional.ofNullable(${this.fieldName}));
    
    ` + inputHook;

        const path = this.apiModule + basePath + "/convert/SearchCriteriaConverter.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("SearchCriteriaConverter class not added yet!");
        }
    }

    private addFieldToPredicates(project: Project, basePath: string) {
        const propertyInputHook = "// @Property input";
        const rawJavaPropertyCode = `private static final String ` +
            `${this.fieldName.toUpperCase()}_PROPERTY = "${this.fieldName}";
    ` + propertyInputHook;

        const predicateInputHook = "// @Predicate input";
        const rawPredicateJavaCode = `sc.get${javaFunctions.capitalize(this.fieldName)}().ifPresent(${this.fieldName} -> ` +
            `predicates.add(criteria.equal(root.get(${this.fieldName.toUpperCase()}_PROPERTY), ${this.fieldName})));
    
        ` + predicateInputHook;

        const path = this.persistenceModule + basePath + "/db/repo/" + this.className + "RepositoryImpl.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(predicateInputHook, rawPredicateJavaCode);
            file.replace(propertyInputHook, rawJavaPropertyCode);
        } else {
            console.error("Custom repository implementation class not added yet!");
        }
    }

    private convertToDbType(javaType: string) {
        let dbType: string;
        switch (javaType) {
            case "String":
                dbType = "varchar(255)";
                break;
            case "int":
            case "long":
                dbType = "BIGINT";
                break;
            case "boolean":
                dbType = "BOOLEAN";
                break;
            case "LocalDateTime":
                dbType = "DATETIME";
                break;
        }

        return dbType;
    }
}

export const addField = new AddField();
