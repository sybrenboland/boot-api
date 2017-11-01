
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";
import {BasePackage, ClassName, getModule, PersistenceModule} from "../../common/Constants";


When("the AddRepository is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddRepository");
    w.editWith(editor, {
        className: ClassName,
        basePackage: BasePackage,
        module: PersistenceModule,
    });
});

Then("a repository class is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/db/repo/" + ClassName + "Repository.java");
});
