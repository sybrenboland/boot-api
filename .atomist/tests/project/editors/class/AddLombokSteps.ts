import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";
import {BasePackage, ClassName, PersistenceModule} from "../../common/Constants";

const pathInput = PersistenceModule + "/src/main/java/" + fileFunctions.toPath(BasePackage)
    + "/db/hibernate/bean/" + ClassName + ".java";
const lombokVersion = "1.16.17";

When("the AddLombok is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddLombok");
    w.editWith(editor, {
        pathToClass: pathInput,
        version: lombokVersion,
    });
});

Then("new bean contains the import (.*)", (p: Project, w, importName: string) => {
        return p.fileContains(pathInput, importName);
});

Then("new bean contains the annotation (.*)", (p: Project, w, annotation: string) => {
    return p.fileContains(pathInput, annotation);
});
