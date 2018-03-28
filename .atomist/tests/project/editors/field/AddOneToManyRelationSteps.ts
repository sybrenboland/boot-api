import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import { ApiModule, BasePackage, DatabaseModule, DomainModule, PersistenceModule, Release } from "../../common/Constants";
import {javaFunctions} from "../../../../editors/functions/JavaClassFunctions";

When("the AddOneToManyRelation is run with one (.*) (.*) in output with many (.*) (.*) in output (.*), with (.*) as methods on the one side and (.*) as methods on the many side",
    (p: Project, w: ProjectScenarioWorld, classNameOneSide: string, isOneSideInOutput: string,
     classNameManySide: string, isManySideInOutput: string, biDirectional: string,
     methodsOneSide: string, methodsManySide: string) => {
        const isBiDirectional = biDirectional === "bi-directional";

        const editor = w.editor("AddOneToManyRelation");
        w.editWith(editor, {
            classNameOne: classNameOneSide,
            showInOutputOne: javaFunctions.showingOrAbsent(isOneSideInOutput) ? "true" : "false",
            classNameMany: classNameManySide,
            showInOutputMany: javaFunctions.showingOrAbsent(isManySideInOutput) ? "true" : "false",
            biDirectional: isBiDirectional ? "true" : "false",
            basePackage: BasePackage,
            methodsOneSide: methodsOneSide,
            methodsManySide: methodsManySide,
            persistenceModule: PersistenceModule,
            apiModule: ApiModule,
            domainModule: DomainModule,
            databaseModule: DatabaseModule,
            release: Release,
        });
    });


