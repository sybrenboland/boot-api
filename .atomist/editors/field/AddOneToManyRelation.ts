import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {fileFunctions} from "../functions/FileFunctions";
import {javaFunctions} from "../functions/JavaClassFunctions";
import {AddReferenceColumn} from "./function/database/AddReferenceColumn";
import {AddForeignKeyChangeSet} from "./function/database/AddForeignKeyChangeSet";
import {AddManySideBean} from "./function/bean/oneToMany/AddManySideBean";
import {AddResourceInterfacePutMethod} from "./function/method/AddResourceInterfacePutMethod";
import {AddResourcePutMethod} from "./function/method/AddResourcePutMethod";
import {AddServiceManyPutMethod} from "./function/method/oneToMany/AddServiceManyPutMethod";
import {AddResourceInterfaceDeleteMethod} from "./function/method/AddResourceInterfaceDeleteMethod";
import {AddResourceDeleteMethod} from "./function/method/AddResourceDeleteMethod";
import {AddServiceManyDeleteMethod} from "./function/method/oneToMany/AddServiceManyDeleteMethod";
import {AddOneSideBean} from "./function/bean/oneToMany/AddOneSideBean";
import {AddServiceOnePutMethod} from "./function/method/oneToMany/AddServiceOnePutMethod";
import {AddServiceOneDeleteMethod} from "./function/method/oneToMany/AddServiceOneDeleteMethod";
import {AddServiceOneGetMethod} from "./function/method/oneToMany/AddServiceOneGetMethod";
import {AddResourceOneGetMethod} from "./function/method/oneToMany/AddResourceOneGetMethod";
import {AddResourceInterfaceOneGetMethod} from "./function/method/oneToMany/AddResourceInterfaceOneGetMethod";
import {AddLinkToConverterOne} from "./function/method/oneToMany/AddLinkToConverterOne";
import {AddFieldToSearchCriteria} from "./function/method/AddFieldToSearchCriteria";
import {AddFieldToPredicates} from "./function/method/AddFieldToPredicates";
import {AddResourceInterfaceGetMethodMany} from "./function/method/manyToMany/AddResourceInterfaceManyGetMethod";
import {AddLinkToConverterMany} from "./function/method/manyToMany/AddLinkToConverterMany";
import {AddServiceGetMethodMany} from "./function/method/oneToMany/AddServiceManyGetMethod";
import {AddResourceGetMethodManyBi} from "./function/method/manyToMany/AddResourceManyGetMethodBi";
import {AddResourceGetMethodManyUni} from "./function/method/manyToMany/AddResourceManyGetMethodUni";
import {Params} from "./function/Params";
import { AddIntegrationTestOneGetMethod } from "./function/method/oneToMany/AddIntegrationTestOneGetMethod";
import { AddIntegrationTestManySetup } from "./function/method/oneToMany/AddIntegrationTestManySetup";
import { AddIntegrationTestOneDeleteMethod } from "./function/method/oneToMany/AddIntegrationTestOneDeleteMethod";
import { AddIntegrationTestOnePutMethod } from "./function/method/oneToMany/AddIntegrationTestOnePutMethod";

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

        let builder = new AddReferenceColumn(this.classNameMany, this.classNameOne)
            .and(new AddForeignKeyChangeSet(this.classNameMany, this.classNameOne + "_id", this.classNameOne))
            .and(new AddManySideBean(this.classNameOne, this.classNameMany));

        this.methodsManySide.split(",").forEach(method => {
            switch (method) {
                case "PUT": {
                    builder.and(new AddResourceInterfacePutMethod(this.classNameMany, this.classNameOne))
                        .and(new AddResourcePutMethod(this.classNameMany, this.classNameOne))
                        .and(new AddServiceManyPutMethod(this.classNameOne, this.classNameMany))
                        .and(new AddIntegrationTestOnePutMethod(this.classNameMany, this.classNameOne, false));
                    break;
                }
                case "DELETE": {
                    builder.and(new AddResourceInterfaceDeleteMethod(this.classNameMany, this.classNameOne))
                        .and(new AddResourceDeleteMethod(this.classNameMany, this.classNameOne))
                        .and(new AddServiceManyDeleteMethod(this.classNameOne, this.classNameMany))
                        .and(new AddIntegrationTestOneDeleteMethod(this.classNameMany, this.classNameOne, false));
                    break;
                }
            }
        });

        if (javaFunctions.trueOfFalse(this.biDirectional)) {
            builder.and(new AddOneSideBean(this.classNameOne, this.classNameMany));

            this.methodsOneSide.split(",").forEach(method => {
                switch (method) {
                    case "PUT": {
                        builder.and(new AddResourceInterfacePutMethod(this.classNameOne, this.classNameMany))
                            .and(new AddResourcePutMethod(this.classNameOne, this.classNameMany))
                            .and(new AddServiceOnePutMethod(this.classNameOne, this.classNameMany))
                            .and(new AddIntegrationTestOnePutMethod(this.classNameOne, this.classNameMany, true));
                        break;
                    }
                    case "DELETE": {
                        builder.and(new AddResourceInterfaceDeleteMethod(this.classNameOne, this.classNameMany))
                            .and(new AddResourceDeleteMethod(this.classNameOne, this.classNameMany))
                            .and(new AddServiceOneDeleteMethod(this.classNameOne, this.classNameMany))
                            .and(new AddIntegrationTestOneDeleteMethod(this.classNameOne, this.classNameMany, true));
                        break;
                    }
                }
            });
        }

        if (javaFunctions.trueOfFalse(this.showInOutputOne)) {
            builder.and(new AddResourceInterfaceOneGetMethod(this.classNameOne, this.classNameMany))
                .and(new AddResourceOneGetMethod(this.classNameOne, this.classNameMany))
                .and(new AddServiceOneGetMethod(this.classNameOne, this.classNameMany))
                .and(new AddLinkToConverterOne(this.classNameOne, this.classNameMany))
                .and(new AddFieldToSearchCriteria(this.classNameOne, this.classNameMany))
                .and(new AddFieldToPredicates(this.classNameOne, this.classNameMany))
                .and(new AddIntegrationTestManySetup(this.classNameOne, this.classNameMany, true))
                .and(new AddIntegrationTestOneGetMethod(this.classNameOne, this.classNameMany));
        }
        if (javaFunctions.trueOfFalse(this.showInOutputMany)) {
            builder.and(new AddLinkToConverterMany(this.classNameOne, this.classNameMany, true))
                .and(new AddResourceInterfaceGetMethodMany(this.classNameOne, this.classNameMany, true))
                .and(new AddIntegrationTestManySetup(this.classNameMany, this.classNameOne, false))
                .and(new AddIntegrationTestOneGetMethod(this.classNameMany, this.classNameOne));

            if(javaFunctions.trueOfFalse(this.biDirectional)) {
                builder.and(new AddResourceGetMethodManyBi(this.classNameOne, this.classNameMany))
                    .and(new AddServiceGetMethodMany(this.classNameOne, this.classNameMany));
            } else {
                builder.and(new AddResourceGetMethodManyUni(this.classNameOne, this.classNameMany));
            }
        }

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

export const addOneToManyRelation = new AddOneToManyRelation();
