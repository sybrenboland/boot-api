import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {addBeanClass} from "./function/AddBeanClass";
import {addConfig} from "../general/AddConfig";
import {addConverter} from "./function/AddConverter";
import {addDomainClass} from "./function/AddDomainClass";
import {addGet} from "./function/AddGET";
import {addLiquibase} from "../general/AddLiquibase";
import {addLombok} from "../general/AddLombok";
import {addPost} from "./function/AddPOST";
import {addPut} from "./function/AddPUT";
import {addDelete} from "./function/AddDELETE";
import {addRepository} from "./function/AddRepository";
import {addResource} from "./function/AddResource";
import {addService} from "./function/AddService";
import {addSpringBoot} from "../general/AddSpringBoot";
import {addSwagger} from "../general/AddSwagger";
import {addSearchCriteria} from "./function/AddSearchCriteria";
import {addDocker} from "../general/AddDocker";
import {addIntegrationTestSetup} from "./function/AddIntegrationTestSetup";
import { addTravisCI } from "../general/AddTravisCI";
import { addSonar } from "../general/AddSonar";

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
        required: false,
    })
    public basePackage: string = "org.shboland";

    @Parameter({
        displayName: "Methods",
        description: "All methods you want implemented (GET,PUT,POST,DELETE,SEARCH)",
        pattern: Pattern.any,
        validInput: "Comma separated http methods e.g. 'GET,POST'",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public methods: string = "DELETE,PUT,POST,SEARCH,GET";

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
        displayName: "Core apiModule name",
        description: "Name of the apiModule with the business logic",
        pattern: Pattern.any,
        validInput: "Just a name",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public coreModule: string = "core";

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
        displayName: "Module name",
        description: "Name of the database module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public databaseModule: string = "db";

    @Parameter({
        displayName: "withTravisCI",
        description: "Do you want CI for this project",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public withTravisCI: string = "true";

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
        displayName: "Port number",
        description: "Port on which the service is exposed",
        pattern: Pattern.port,
        validInput: "Port",
        minLength: 0,
        maxLength: 4,
        required: false,
    })
    public port: string = "0";

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

    @Parameter({
        displayName: "Version",
        description: "Version of resteasy",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public restEasyVersion: string = "";

    @Parameter({
        displayName: "Docker image prefix",
        description: "Prefix of the docker image",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public dockerImagePrefix: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of docker plugin",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public dockerPluginVersion: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of h2 database",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public h2Version: string = "";

    @Parameter({
        displayName: "Version",
        description: "Version of jackson mapper",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public jacksonMapperVersion: string = "";

    @Parameter({
        displayName: "Dockerhub user",
        description: "User name for your dockerhub account",
        pattern: Pattern.any,
        validInput: "username",
        minLength: 0,
        maxLength: 50,
        required: false,
    })
    public dockerhubUser: string = "<your dockerhub username>";

    @Parameter({
        displayName: "Dockerhub password",
        description: "Password for your dockerhub account",
        pattern: Pattern.any,
        validInput: "Password",
        minLength: 0,
        maxLength: 50,
        required: false,
    })
    public dockerhubPassword: string = "<your dockerhub password>";

    @Parameter({
        displayName: "Github organization",
        description: "Your github organization name",
        pattern: Pattern.any,
        validInput: "name",
        minLength: 0,
        maxLength: 50,
        required: false,
    })
    public githubOrganization: string = "<your github organization name>";

    @Parameter({
        displayName: "Sonar token",
        description: "Sonar token of your sonar cloud account",
        pattern: Pattern.any,
        validInput: "token",
        minLength: 0,
        maxLength: 50,
        required: false,
    })
    public sonarToken: string = "<your sonar token>";

    @Parameter({
        displayName: "Sonar project key",
        description: "Sonar key of your project",
        pattern: Pattern.any,
        validInput: "Must be unique in your organizations sonar",
        minLength: 0,
        maxLength: 50,
        required: false,
    })
    public sonarProjectKey: string = "shboland:api";


    public edit(project: Project) {

        this.setSpringBootVersion(project);
        this.addTravisCI(project);
        this.addConfigFiles(project);
        this.addLiquibase(project);
        this.addBeanClass(project);
        this.addIntegrationTestSetup(project);
        this.addDomainClass(project);
        this.addLombok(project);
        this.addRepository(project);
        this.addConverter(project);
        this.addService(project);
        this.addResource(project);
        this.addMethods(project);
        this.addSwagger(project);
        this.addDocker(project);
        this.addSonar(project);
    }

    private setSpringBootVersion(project: Project) {
        if (this.basePackage !== "org.shboland") {
            addSpringBoot.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addSpringBoot.apiModule = this.apiModule;
        }
        if (this.springBootVersion !== "") {
            addSpringBoot.version = this.springBootVersion;
        }
        addSpringBoot.edit(project);
    }

    private addTravisCI(project: Project) {

        if (this.withTravisCI) {
            addTravisCI.edit(project);
        }
    }
    
    private addConfigFiles(project: Project) {
        if (this.basePackage !== "org.shboland") {
            addConfig.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addConfig.apiModule = this.apiModule;
        }
        if (this.persistenceModule !== "persistence") {
            addConfig.persistenceModule = this.persistenceModule;
        }
        if (this.domainModule !== "domain") {
            addConfig.domainModule = this.domainModule;
        }
        if (this.port !== "0") {
            addConfig.port = this.port;
        }

        addConfig.edit(project);
    }

    private addLiquibase(project: Project) {

        if (this.apiModule !== "api") {
            addLiquibase.apiModule = this.apiModule;
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
        if (this.basePackage !== "org.shboland") {
            addBeanClass.basePackage = this.basePackage;
        }
        if (this.persistenceModule !== "persistence") {
            addBeanClass.persistenceModule = this.persistenceModule;
        }
        if (this.databaseModule !== "db") {
            addBeanClass.databaseModule = this.databaseModule;
        }
        if (this.release !== "") {
            addBeanClass.release = this.release;
        }

        addBeanClass.edit(project);
    }

    private addIntegrationTestSetup(project: Project) {

        addIntegrationTestSetup.className = this.className;
        addIntegrationTestSetup.basePackage = this.basePackage;

        if (this.apiModule !== "api") {
            addIntegrationTestSetup.apiModule = this.apiModule;
        }
        if (this.h2Version !== "") {
            addIntegrationTestSetup.h2Version = this.h2Version;
        }
        if (this.jacksonMapperVersion !== "") {
            addIntegrationTestSetup.jacksonMapperVersion = this.jacksonMapperVersion;
        }

        addIntegrationTestSetup.edit(project);
    }

    private addDomainClass(project: Project) {
        addDomainClass.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addDomainClass.basePackage = this.basePackage;
        }
        if (this.domainModule !== "domain") {
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
        addLombok.pathToClass = this.domainModule + "/src/main/java/" + this.basePackage.replace(/\./gi, "/")
            + "/domain/entities/Json" + this.className + ".java";
        addLombok.edit(project);

        addLombok.pathToClass = this.persistenceModule + "/src/main/java/" + this.basePackage.replace(/\./gi, "/")
            + "/persistence/db/hibernate/bean/" + this.className + ".java";
        addLombok.edit(project);
    }

    private addRepository(project: Project) {

        addRepository.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addRepository.basePackage = this.basePackage;
        }
        if (this.persistenceModule !== "persistence") {
            addRepository.module = this.persistenceModule;
        }

        addRepository.edit(project);
    }

    private addConverter(project: Project) {

        addConverter.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addConverter.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addConverter.module = this.apiModule;
        }

        addConverter.edit(project);
    }

    private addService(project: Project) {

        addService.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addService.basePackage = this.basePackage;
        }
        if (this.coreModule !== "core") {
            addService.module = this.coreModule;
        }

        addService.edit(project);
    }

    private addResource(project: Project) {

        addResource.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addResource.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
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
                case "DELETE": {
                    this.addDelete(project);
                    break;
                }
                case "SEARCH": {
                    this.addSearchCriteria(project);
                    break;
                }
            }
        });
    }

    private addGet(project: Project) {

        addGet.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addGet.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addGet.apiModule = this.apiModule;
        }
        if (this.coreModule !== "core") {
            addGet.coreModule = this.coreModule;
        }

        addGet.edit(project);
    }

    private addPost(project: Project) {

        addPost.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addPost.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addPost.apiModule = this.apiModule;
        }
        if (this.coreModule !== "core") {
            addPost.coreModule = this.coreModule;
        }

        addPost.edit(project);
    }

    private addPut(project: Project) {

        addPut.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addPut.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addPut.apiModule = this.apiModule;
        }
        if (this.coreModule !== "core") {
            addPut.coreModule = this.coreModule;
        }

        addPut.edit(project);
    }

    private addDelete(project: Project) {

        addDelete.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addDelete.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addDelete.apiModule = this.apiModule;
        }
        if (this.coreModule !== "core") {
            addDelete.coreModule = this.coreModule;
        }

        addDelete.edit(project);
    }

    private addSearchCriteria(project: Project) {

        addSearchCriteria.className = this.className;
        if (this.basePackage !== "org.shboland") {
            addSearchCriteria.basePackage = this.basePackage;
        }
        if(this.persistenceModule !== "persistence") {
            addSearchCriteria.persistenceModule = this.persistenceModule;
        }
        if(this.apiModule !== "api") {
            addSearchCriteria.apiModule = this.apiModule;
        }
        if(this.domainModule !== "domain") {
            addSearchCriteria.domainModule = this.domainModule;
        }
        if(this.restEasyVersion !== "") {
            addSearchCriteria.restEasyVersion = this.restEasyVersion;
        }

        addSearchCriteria.edit(project);
    }

    private addSwagger(project: Project) {

        if (this.basePackage !== "org.shboland") {
            addSwagger.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addSwagger.apiModule = this.apiModule;
        }
        if (this.swaggerVersion !== "") {
            addSwagger.version = this.swaggerVersion;
        }

        addSwagger.edit(project);
    }

    private addDocker(project: Project) {
        if (this.basePackage !== "org.shboland") {
            addDocker.basePackage = this.basePackage;
        }
        if (this.apiModule !== "api") {
            addDocker.apiModule = this.apiModule;
        }
        if (this.dockerImagePrefix !== "") {
            addDocker.dockerImagePrefix = this.dockerImagePrefix;
        }
        if (this.dockerPluginVersion !== "") {
            addDocker.dockerPluginVersion = this.dockerPluginVersion;
        }
        if (this.release !== "") {
            addDocker.release = this.release;
        }
        if (this.port !== "0") {
            addDocker.port = this.port;
        }
        if (this.dockerhubUser !== "<your dockerhub username>") {
            addDocker.dockerhubUser = this.dockerhubUser;
        }
        if (this.dockerhubPassword !== "<your dockerhub password>") {
            addDocker.dockerhubPassword = this.dockerhubPassword;
        }

        addDocker.edit(project);
    }

    private addSonar(project: Project) {

        if (this.githubOrganization !== "<your github organization name>") {
            addSonar.githubOrganization = this.githubOrganization;
        }
        if (this.sonarToken !== "<your sonar token>") {
            addSonar.sonarToken = this.sonarToken;
        }
        if (this.sonarProjectKey !== "shboland:api") {
            addSonar.sonarProjectKey = this.sonarProjectKey;
        }

        addSonar.edit(project);
    }
}

export const apiForBean = new ApiForBean();
