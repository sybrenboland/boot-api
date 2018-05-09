import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {fileFunctions} from "../functions/FileFunctions";
import {javaFunctions} from "../functions/JavaClassFunctions";
import {AddCombinationTableChangeSet} from "./function/database/AddCombinationTableChangeSet";
import {AddForeignKeyChangeSet} from "./function/database/AddForeignKeyChangeSet";
import {AddOtherSideManyBean} from "./function/bean/manyToMany/AddOtherSideManyBean";
import {AddMappingSideManyBean} from "./function/bean/manyToMany/AddMappingSideManyBean";
import {AddResourceInterfaceOneGetMethod} from "./function/method/oneToMany/AddResourceInterfaceOneGetMethod";
import {AddResourceOneGetMethod} from "./function/method/oneToMany/AddResourceOneGetMethod";
import {AddLinkToConverterOne} from "./function/method/oneToMany/AddLinkToConverterOne";
import {AddFieldToSearchCriteria} from "./function/method/AddFieldToSearchCriteria";
import {AddFieldToPredicates} from "./function/method/AddFieldToPredicates";
import {AddServiceOneGetMethod} from "./function/method/oneToMany/AddServiceOneGetMethod";
import {Params} from "./function/Params";
import {AddResourceInterfacePutMethod} from "./function/method/AddResourceInterfacePutMethod";
import {AddResourcePutMethod} from "./function/method/AddResourcePutMethod";
import {AddResourceInterfaceDeleteMethod} from "./function/method/AddResourceInterfaceDeleteMethod";
import {AddResourceDeleteMethod} from "./function/method/AddResourceDeleteMethod";
import {AddServiceMappingDeleteMethod} from "./function/method/manyToMany/AddServiceMappingDeleteMethod";
import {AddServiceMappingPutMethod} from "./function/method/manyToMany/AddServiceMappingPutMethod";
import {AddServiceOtherPutMethod} from "./function/method/manyToMany/AddServiceOtherPutMethod";
import {AddServiceOtherDeleteMethod} from "./function/method/manyToMany/AddServiceOtherDeleteMethod";
import { AddIntegrationTestOnePutMethod } from "./function/method/integrationTest/AddIntegrationTestOnePutMethod";
import { AddIntegrationTestOneDeleteMethod } from "./function/method/integrationTest/AddIntegrationTestOneDeleteMethod";
import { AddIntegrationTestManySetup } from "./function/method/integrationTest/AddIntegrationTestManySetup";
import { AddIntegrationTestFactoryMethodsOne } from "./function/method/integrationTest/AddIntegrationTestFactoryMethodsOne";
import { AddIntegrationTestFactoryMethodsMany } from "./function/method/integrationTest/AddIntegrationTestFactoryMethodsMany";

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
        displayName: "Api module name",
        description: "Name of the api module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "api";

    @Parameter({
        displayName: "Core module name",
        description: "Name of the module with the business logic",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public coreModule: string = "core";

    @Parameter({
        displayName: "Database module name",
        description: "Name of the module for the database description",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public databaseModule: string = "db";

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

        let builder = new AddCombinationTableChangeSet(this.classNameMappedBy, this.classNameOther)
            .and(new AddForeignKeyChangeSet(this.classNameMappedBy + "_" + this.classNameOther, this.classNameMappedBy + "_id", this.classNameMappedBy))
            .and(new AddForeignKeyChangeSet(this.classNameMappedBy + "_" + this.classNameOther, this.classNameOther + "_id", this.classNameOther))
            .and(new AddOtherSideManyBean(this.classNameMappedBy, this.classNameOther));

        if (javaFunctions.trueOfFalse(this.biDirectional)) {
            builder.and(new AddMappingSideManyBean(this.classNameMappedBy, this.classNameOther));
        }

        if (javaFunctions.trueOfFalse(this.showInOutputMapped)) {
            builder.and(new AddResourceInterfaceOneGetMethod(this.classNameMappedBy, this.classNameOther))
                .and(new AddResourceOneGetMethod(this.classNameMappedBy, this.classNameOther))
                .and(new AddServiceOneGetMethod(this.classNameMappedBy, this.classNameOther))
                .and(new AddLinkToConverterOne(this.classNameMappedBy, this.classNameOther))
                .and(new AddFieldToSearchCriteria(this.classNameMappedBy, this.classNameOther))
                .and(new AddFieldToPredicates(this.classNameMappedBy, this.classNameOther))
                .and(new AddIntegrationTestManySetup(this.classNameMappedBy, this.classNameOther, true))
                .and(new AddIntegrationTestFactoryMethodsOne(this.classNameMappedBy, this.classNameOther, javaFunctions.trueOfFalse(this.biDirectional), true));
        }
        if (javaFunctions.trueOfFalse(this.showInOutputOther)) {
            builder.and(new AddResourceInterfaceOneGetMethod(this.classNameOther, this.classNameMappedBy))
                .and(new AddResourceOneGetMethod(this.classNameOther, this.classNameMappedBy))
                .and(new AddServiceOneGetMethod(this.classNameOther, this.classNameMappedBy))
                .and(new AddLinkToConverterOne(this.classNameOther, this.classNameMappedBy))
                .and(new AddFieldToSearchCriteria(this.classNameOther, this.classNameMappedBy))
                .and(new AddFieldToPredicates(this.classNameOther, this.classNameMappedBy))
                .and(new AddIntegrationTestManySetup(this.classNameOther, this.classNameMappedBy, true))
                .and(new AddIntegrationTestFactoryMethodsMany(this.classNameOther, this.classNameOther, javaFunctions.trueOfFalse(this.biDirectional), true));
        }

        this.methodsMappingSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    builder.and(new AddResourceInterfacePutMethod(this.classNameMappedBy, this.classNameOther))
                        .and(new AddResourcePutMethod(this.classNameMappedBy, this.classNameOther))
                        .and(new AddServiceMappingPutMethod(this.classNameMappedBy, this.classNameOther))
                        .and(new AddIntegrationTestOnePutMethod(this.classNameMappedBy, this.classNameOther, true));
                    break;
                }
                case "DELETE": {
                    if (javaFunctions.trueOfFalse(this.biDirectional)) {
                        builder.and(new AddResourceInterfaceDeleteMethod(this.classNameMappedBy, this.classNameOther))
                            .and(new AddResourceDeleteMethod(this.classNameMappedBy, this.classNameOther))
                            .and(new AddServiceMappingDeleteMethod(this.classNameMappedBy, this.classNameOther))
                            .and(new AddIntegrationTestOneDeleteMethod(this.classNameMappedBy, this.classNameOther, true));
                    }
                    break;
                }
            }
        });

        this.methodsOtherSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    builder.and(new AddResourceInterfacePutMethod(this.classNameOther, this.classNameMappedBy))
                        .and(new AddResourcePutMethod(this.classNameOther, this.classNameMappedBy))
                        .and(new AddServiceOtherPutMethod(this.classNameMappedBy, this.classNameOther))
                        .and(new AddIntegrationTestOnePutMethod(this.classNameOther, this.classNameMappedBy, true));
                    break;
                }
                case "DELETE": {
                    builder.and(new AddResourceInterfaceDeleteMethod(this.classNameOther, this.classNameMappedBy))
                        .and(new AddResourceDeleteMethod(this.classNameOther, this.classNameMappedBy))
                        .and(new AddServiceOtherDeleteMethod(this.classNameMappedBy, this.classNameOther))
                        .and(new AddIntegrationTestOneDeleteMethod(this.classNameOther, this.classNameMappedBy, true));
                    break;
                }
            }
        });

        const params: Params = new Params(
            '/src/main/java/' + fileFunctions.toPath(this.basePackage),
            this.biDirectional,
            this.basePackage,
            this.persistenceModule,
            this.apiModule,
            this.databaseModule,
            this.coreModule,
            this.release);

        builder.execute(project, params);
    }
}

export const addManyToManyRelation = new AddManyToManyRelation();
