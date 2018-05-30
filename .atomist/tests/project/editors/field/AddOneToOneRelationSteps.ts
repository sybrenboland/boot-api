import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import { ApiModule, BasePackage, CoreModule, DatabaseModule, PersistenceModule, Release } from "../../common/Constants";
import {javaFunctions} from "../../../../editors/functions/JavaClassFunctions";

When("the AddOneToOneRelation is run with one \"([^\"]*)\" (.*) in output with many \"([^\"]*)\" (.*) in output (.*), with \"([^\"]*)\" as methods on the mapping side and \"([^\"]*)\" as methods on the other side",
    (p: Project, w: ProjectScenarioWorld, classNameMappingSide: string, isMappingSideInOutput: string,
     classNameOtherSide: string, isOtherSideInOutput: string, biDirectional: string, methodsMappingSide: string,
     methodsOtherSide: string) => {
        const isBiDirectional = biDirectional === "bi-directional";

        const editor = w.editor("AddOneToOneRelation");
        w.editWith(editor, {
            classNameMappedBy: classNameMappingSide,
            showInOutputMapped: javaFunctions.showingOrAbsent(isMappingSideInOutput) ? "true" : "false",
            classNameOther: classNameOtherSide,
            showInOutputOther: javaFunctions.showingOrAbsent(isOtherSideInOutput) ? "true" : "false",
            biDirectional: isBiDirectional ? "true" : "false",
            basePackage: BasePackage,
            methodsMappingSide: methodsMappingSide,
            methodsOtherSide: methodsOtherSide,
            persistenceModule: PersistenceModule,
            apiModule: ApiModule,
            coreModule: CoreModule,
            databaseModule: DatabaseModule,
            release: Release,
        });
});
