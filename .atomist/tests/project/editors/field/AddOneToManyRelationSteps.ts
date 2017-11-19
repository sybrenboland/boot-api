import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage, DomainModule, PersistenceModule, Release} from "../../common/Constants";
import {javaFunctions} from "../../../../editors/functions/JavaClassFunctions";


When("the AddOneToManyRelation is run with one (.*) (.*) in output with many (.*) (.*) in output",
    (p: Project, w: ProjectScenarioWorld, classNameOneSide: string, isOneSideInOutput: string,
     classNameManySide: string, isManySideInOutput: string) => {

    const editor = w.editor("AddOneToManyRelation");
    w.editWith(editor, {
        classNameOne: classNameOneSide,
        showInOutputOne: javaFunctions.showingOrAbsent(isOneSideInOutput),
        classNameMany: classNameManySide,
        showInOutputMany: javaFunctions.showingOrAbsent(isManySideInOutput),
        basePackage: BasePackage,
        persistenceModule: PersistenceModule,
        apiModule: ApiModule,
        domainModule: DomainModule,
        release: Release,
    });
});

