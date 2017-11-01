import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {addBeanClass} from "./AddBeanClass";
import {addConfig} from "./AddConfig";
import {addConverter} from "./AddConverter";
import {addDomainClass} from "./AddDomainClass";
import {addGet} from "./AddGET";
import {addLiquibase} from "./AddLiquibase";
import {addLombok} from "./AddLombok";
import {addPost} from "./AddPOST";
import {addPut} from "./AddPUT";
import {addRepository} from "./AddRepository";
import {addResource} from "./AddResource";
import {addService} from "./AddService";
import {addSpringBoot} from "./AddSpringBoot";
import {addSwagger} from "./AddSwagger";

/**
 * ApiForBean editor
 * - Adds chain from persistence to api for a bean
 */
@Editor("ApiForBean", "Add whole api to persistence chain")
@Tags("rug", "api", "persistence", "domain", "shboland")
export class ApiForBean implements EditProject {
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
        displayName: "Methods",
        description: "All methods you want implemented",
        pattern: Pattern.any,
        validInput: "Comma separated http methods e.g. 'GET,POST'",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public methods: string = "PUT,POST,GET";

    @Parameter({
        displayName: "Module name",
        description: "Name of the persistence module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public persistenceModule: string = "";

    @Parameter({
        displayName: "Module name",
        description: "Name of the api module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "";

    @Parameter({
        displayName: "Module name",
        description: "Name of the domain module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public domainModule: string = "";

    @Parameter({
        displayName: "Release",
        description: "Release for with database changes are meant",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public release: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of Spring Boot",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public springBootVersion: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of jackson",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public jacksonVersion: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of lombok",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public lombokVersion: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of liquibase",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public liquibaseVersion: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of postgres driver",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public postgresVersion: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of swagger",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public swaggerVersion: string = "";

    public edit(project: Project) {

        this.setSpringBootVersion(project);
        this.addConfigFiles(project);
        this.addLiquibase(project);
        this.addBeanClass(project);
        this.addDomainClass(project);
        this.addLombok(project);
        this.addRepository(project);
        this.addConverter(project);
        this.addService(project);
        this.addResource(project);
        this.addMethods(project);
        this.addSwagger(project);
    }

    private setSpringBootVersion(project: Project) {
        addSpringBoot.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addSpringBoot.apiModule = this.apiModule;
        }
        if (this.springBootVersion !== "") {
            addSpringBoot.version = this.springBootVersion;
        }
        addSpringBoot.edit(project);
    }
    
    private addConfigFiles(project: Project) {
        addConfig.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addConfig.apiModule = this.apiModule;
        }
        if (this.persistenceModule !== "") {
            addConfig.persistenceModule = this.persistenceModule;
        }
        if (this.domainModule !== "") {
            addConfig.domainModule = this.domainModule;
        }

        addConfig.edit(project);
    }

    private addLiquibase(project: Project) {

        if (this.apiModule !== "") {
            addLiquibase.apiModule = this.apiModule;
        }
        if (this.persistenceModule !== "") {
            addLiquibase.persistenceModule = this.persistenceModule;
        }
        if (this.liquibaseVersion !== "") {
            addLiquibase.liquibaseVersion = this.liquibaseVersion;
        }
        if (this.postgresVersion !== "") {
            addLiquibase.postgresVersion = this.postgresVersion;
        }

        addLiquibase.edit(project);
    }

    private addBeanClass(project: Project) {

        addBeanClass.className = this.className;
        addBeanClass.basePackage = this.basePackage;
        if (this.persistenceModule !== "") {
            addBeanClass.module = this.persistenceModule;
        }
        if (this.release !== "") {
            addBeanClass.release = this.release;
        }

        addBeanClass.edit(project);
    }

    private addDomainClass(project: Project) {
        addDomainClass.className = this.className;
        addDomainClass.basePackage = this.basePackage;
        if (this.domainModule !== "") {
            addDomainClass.module = this.domainModule;
        }
        if (this.jacksonVersion !== "") {
            addDomainClass.version = this.jacksonVersion;
        }

        addDomainClass.edit(project);
    }

    private addLombok(project: Project) {
        if (this.lombokVersion !== "") {
            addLombok.version = this.lombokVersion;
        }
        addLombok.pathToClass = "domain/src/main/java/" + this.basePackage.replace(/\./gi, "/")
            + "/domain/Json" + this.className + ".java";
        addLombok.edit(project);

        addLombok.pathToClass = "persistence/src/main/java/" + this.basePackage.replace(/\./gi, "/")
            + "/db/hibernate/bean/" + this.className + ".java";
        addLombok.edit(project);
    }

    private addRepository(project: Project) {

        addRepository.className = this.className;
        addRepository.basePackage = this.basePackage;
        if (this.persistenceModule !== "") {
            addRepository.module = this.persistenceModule;
        }

        addRepository.edit(project);
    }

    private addConverter(project: Project) {

        addConverter.className = this.className;
        addConverter.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addConverter.module = this.apiModule;
        }

        addConverter.edit(project);
    }

    private addService(project: Project) {

        addService.className = this.className;
        addService.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addService.module = this.apiModule;
        }

        addService.edit(project);
    }

    private addResource(project: Project) {

        addResource.className = this.className;
        addResource.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addResource.module = this.apiModule;
        }

        addResource.edit(project);
    }
    
    private addMethods(project: Project) {

        this.methods.split(",").forEach(method => {
            switch (method) {
                case "GET": {
                    this.addGet(project);
                    break;
                }
                case "POST": {
                    this.addPost(project);
                    break;
                }
                case "PUT": {
                    this.addPut(project);
                    break;
                }
            }
        });
    }

    private addGet(project: Project) {

        addGet.className = this.className;
        addGet.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addGet.module = this.apiModule;
        }

        addGet.edit(project);
    }

    private addPost(project: Project) {

        addPost.className = this.className;
        addPost.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addPost.module = this.apiModule;
        }

        addPost.edit(project);
    }

    private addPut(project: Project) {

        addPut.className = this.className;
        addPut.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addPut.module = this.apiModule;
        }

        addPut.edit(project);
    }

    private addSwagger(project: Project) {

        addSwagger.basePackage = this.basePackage;
        if (this.apiModule !== "") {
            addSwagger.apiModule = this.apiModule;
        }
        if (this.swaggerVersion !== "") {
            addSwagger.version = this.swaggerVersion;
        }

        addSwagger.edit(project);
    }
}

export const apiForBean = new ApiForBean();
