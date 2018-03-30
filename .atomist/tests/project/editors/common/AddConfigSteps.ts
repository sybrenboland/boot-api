
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";
import {ApiModule, BasePackage, DomainModule, getModule, PersistenceModule} from "../../common/Constants";

When("the AddConfig is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddConfig");
    w.editWith(editor, {
        basePackage: BasePackage,
        apiModule: ApiModule,
        persistenceModule: PersistenceModule,
        domainModule: DomainModule,
    });
});

Then("a (.*) configuration file has been added to (.*) module$",
    (p: Project, w, configName: string, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/configuration/" + configName + "Configuration.java");
});

Then("the (.*) configuration file imports the (.*) configuration$",
    (p: Project, w, baseModuleName: string, importModuleName: string) => {
    return p.fileContains(getModule(baseModuleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/configuration/" + baseModuleName + "Configuration.java",
        importModuleName + "Configuration.class",
        );
});
