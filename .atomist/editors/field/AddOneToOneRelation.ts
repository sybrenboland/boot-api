import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {fileFunctions} from "../functions/FileFunctions";
import {javaFunctions} from "../functions/JavaClassFunctions";
import {Params} from "./function/Params";
import {AddReferenceColumn} from "./function/database/AddReferenceColumn";
import {AddForeignKeyChangeSet} from "./function/database/AddForeignKeyChangeSet";
import {AddOtherSideOneBeanBi} from "./function/bean/oneToOne/AddOtherSideOneBeanBi";
import {AddMappingSideOneBean} from "./function/bean/oneToOne/AddMappingSideOneBean";
import {ResetPrimaryKeyToForeignKey} from "./function/database/ResetPrimaryKeyToForeignKey";
import {AddOtherSideOneBeanUni} from "./function/bean/oneToOne/AddOtherSideOneBeanUni";
import {AddLinkToConverterMany} from "./function/method/manyToMany/AddLinkToConverterMany";
import {AddResourceInterfaceGetMethodMany} from "./function/method/manyToMany/AddResourceInterfaceManyGetMethod";
import {AddResourceGetMethodManyBi} from "./function/method/manyToMany/AddResourceManyGetMethodBi";
import {AddServiceGetMethodMany} from "./function/method/oneToMany/AddServiceManyGetMethod";
import {AddResourceGetMethodManyUni} from "./function/method/manyToMany/AddResourceManyGetMethodUni";
import {AddResourceInterfaceOnePutMethod} from "./function/method/oneToOne/AddResourceInterfaceOnePutMethod";
import {AddResourceOnePutMethod} from "./function/method/oneToOne/AddResourceOnePutMethod";
import {AddResourceInterfaceOneDeleteMethod} from "./function/method/oneToOne/AddResourceInterfaceOneDeleteMethod";
import {AddResourceOneDeleteMethodUni} from "./function/method/oneToOne/AddResourceOneDeleteMethodUni";
import {AddServiceOnePutMethodUni} from "./function/method/oneToOne/AddServiceOnePutMethodUni";
import { AddIntegrationTestManySetup } from "./function/method/integrationTest/AddIntegrationTestManySetup";
import { AddFieldIntegrationTestFactoryOneUni } from "./function/method/integrationTest/AddFieldIntegrationTestFactoryOneUni";
import { AddIntegrationTestDeleteMethod } from "./function/method/integrationTest/AddIntegrationTestDeleteMethod";
import { AddIntegrationTestPutMethod } from "./function/method/integrationTest/AddIntegrationTestPutMethod";
import { AddResourceInterfacePutMethod } from "./function/method/AddResourceInterfacePutMethod";
import { AddResourcePutMethod } from "./function/method/AddResourcePutMethod";
import { AddServiceManyPutMethod } from "./function/method/oneToMany/AddServiceManyPutMethod";
import { AddServiceManyDeleteMethod } from "./function/method/oneToMany/AddServiceManyDeleteMethod";
import { AddResourceDeleteMethod } from "./function/method/AddResourceDeleteMethod";
import { AddResourceInterfaceDeleteMethod } from "./function/method/AddResourceInterfaceDeleteMethod";
import { AddIntegrationTestFactoryMethodsOne } from "./function/method/integrationTest/AddIntegrationTestFactoryMethodsOne";
import { NoCreatePutResource } from "./function/method/oneToOne/NoCreatePutResource";
import { DeletePostResource } from "./function/method/oneToOne/DeletePostResource";
import { AddIntegrationTestDeleteMethodUni } from "./function/method/integrationTest/AddIntegrationTestDeleteMethodUni";
import { AddIntegrationTestOneGetMethod } from "./function/method/integrationTest/AddIntegrationTestOneGetMethod";
import { AddIntegrationTestGetMethodOneSide } from "./function/method/integrationTest/AddIntegrationTestGetMethodOneSide";
import {ExtendRepositoryUnitTestWithRelation} from "./function/method/oneToOne/ExtendRepositoryUnitTestWithRelation";

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
        required: false,
    })
    public basePackage: string = "org.shboland";

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

        const biDirectional = javaFunctions.trueOfFalse(this.biDirectional);
        let builder = new AddForeignKeyChangeSet(this.classNameOther, this.classNameMappedBy + "_id", this.classNameMappedBy);

        if (biDirectional) {
            builder.and(new AddReferenceColumn(this.classNameOther, this.classNameMappedBy))
                .and(new AddOtherSideOneBeanBi(this.classNameMappedBy, this.classNameOther))
                .and(new AddMappingSideOneBean(this.classNameMappedBy, this.classNameOther));
        } else {
            builder.and(new AddOtherSideOneBeanUni(this.classNameMappedBy, this.classNameOther))
                .and(new ResetPrimaryKeyToForeignKey(this.classNameMappedBy, this.classNameOther))
                .and(new AddFieldIntegrationTestFactoryOneUni(this.classNameOther, this.classNameMappedBy))
                .and(new DeletePostResource(this.classNameOther))
                .and(new NoCreatePutResource(this.classNameOther))
                .and(new ExtendRepositoryUnitTestWithRelation(this.classNameMappedBy, this.classNameOther));
        }

        if (javaFunctions.trueOfFalse(this.showInOutputMapped)) {
            builder.and(new AddLinkToConverterMany(this.classNameOther, this.classNameMappedBy, false))
                .and(new AddResourceInterfaceGetMethodMany(this.classNameMappedBy, this.classNameOther, false))
                .and(new AddIntegrationTestManySetup(this.classNameMappedBy, this.classNameOther, true));

            if(biDirectional) {
                builder.and(new AddResourceGetMethodManyBi(this.classNameMappedBy, this.classNameOther))
                    .and(new AddServiceGetMethodMany(this.classNameMappedBy, this.classNameOther))
                    .and(new AddIntegrationTestFactoryMethodsOne(this.classNameMappedBy, this.classNameOther, true))
                    .and(new AddIntegrationTestGetMethodOneSide(this.classNameMappedBy, this.classNameOther));
            } else {
                builder.and(new AddResourceGetMethodManyUni(this.classNameMappedBy, this.classNameOther))
                    .and(new AddIntegrationTestOneGetMethod(this.classNameMappedBy, this.classNameOther, true));
            }
        }

        if (javaFunctions.trueOfFalse(this.showInOutputOther)) {
            builder.and(new AddLinkToConverterMany(this.classNameMappedBy, this.classNameOther, false))
                .and(new AddResourceInterfaceGetMethodMany(this.classNameOther, this.classNameMappedBy, false));

            if(biDirectional) {
                builder.and(new AddResourceGetMethodManyBi(this.classNameOther, this.classNameMappedBy))
                    .and(new AddServiceGetMethodMany(this.classNameOther, this.classNameMappedBy))
                    .and(new AddIntegrationTestManySetup(this.classNameOther, this.classNameMappedBy, false))
                    .and(new AddIntegrationTestFactoryMethodsOne(this.classNameOther, this.classNameMappedBy, false))
                    .and(new AddIntegrationTestGetMethodOneSide(this.classNameOther, this.classNameMappedBy));
            } else {
                builder.and(new AddResourceGetMethodManyUni(this.classNameOther, this.classNameMappedBy))
                    .and(new AddIntegrationTestOneGetMethod(this.classNameOther, this.classNameMappedBy, false));
            }
        }

        this.methodsMappingSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    builder.and(new AddResourceInterfacePutMethod(this.classNameMappedBy, this.classNameOther))
                        .and(new AddResourcePutMethod(this.classNameMappedBy, this.classNameOther))
                        .and(new AddServiceManyPutMethod(this.classNameOther, this.classNameMappedBy, true))
                        .and(new AddIntegrationTestPutMethod(this.classNameMappedBy, this.classNameOther, false, javaFunctions.trueOfFalse(this.biDirectional), false));
                    break;
                }
                case "DELETE": {
                    if (biDirectional) {
                        builder.and(new AddResourceInterfaceDeleteMethod(this.classNameMappedBy, this.classNameOther))
                            .and(new AddResourceDeleteMethod(this.classNameMappedBy, this.classNameOther))
                            .and(new AddServiceManyDeleteMethod(this.classNameOther, this.classNameMappedBy, true))
                            .and(new AddIntegrationTestDeleteMethod(this.classNameMappedBy, this.classNameOther, false, false));
                    } else {
                        builder.and(new AddResourceInterfaceOneDeleteMethod(this.classNameMappedBy, this.classNameOther))
                            .and(new AddResourceOneDeleteMethodUni(this.classNameMappedBy, this.classNameOther))
                            .and(new AddIntegrationTestDeleteMethodUni(this.classNameMappedBy, this.classNameOther));
                    }
                    break;
                }
            }
        });

        this.methodsOtherSide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    if (biDirectional) {
                        builder.and(new AddResourceInterfacePutMethod(this.classNameOther, this.classNameMappedBy))
                            .and(new AddResourcePutMethod(this.classNameOther, this.classNameMappedBy))
                            .and(new AddServiceManyPutMethod(this.classNameMappedBy, this.classNameOther, false))
                            .and(new AddIntegrationTestPutMethod(this.classNameOther, this.classNameMappedBy, false, javaFunctions.trueOfFalse(this.biDirectional), false));
                    } else {
                        builder.and(new AddResourceInterfaceOnePutMethod(this.classNameOther, this.classNameMappedBy))
                            .and(new AddResourceOnePutMethod(this.classNameOther, this.classNameMappedBy))
                            .and(new AddServiceOnePutMethodUni(this.classNameOther, this.classNameMappedBy))
                            .and(new AddIntegrationTestPutMethod(this.classNameOther, this.classNameMappedBy, false, javaFunctions.trueOfFalse(this.biDirectional), false));
                    }
                    break;
                }
                case "DELETE": {
                    if (biDirectional) {
                        builder.and(new AddResourceInterfaceDeleteMethod(this.classNameOther, this.classNameMappedBy))
                            .and(new AddResourceDeleteMethod(this.classNameOther, this.classNameMappedBy))
                            .and(new AddServiceManyDeleteMethod(this.classNameMappedBy, this.classNameOther, false))
                            .and(new AddIntegrationTestDeleteMethod(this.classNameOther, this.classNameMappedBy, false, false));
                    }
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

export const addOneToOneRelation = new AddOneToOneRelation();
