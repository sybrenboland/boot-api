import { Project } from "@atomist/rug/model/Project";
import { ProjectScenarioWorld, When, Then } from "@atomist/rug/test/project/Core";
import { ApiModule, BasePackage, getModule } from "../../common/Constants";


When("the AddTravisCI is run", (p: Project, w: ProjectScenarioWorld) => {

    const editor = w.editor("AddTravisCI");
    w.editWith(editor);
});

Then("a travis config file is added to the root directory", (p: Project, w, module) => {
    return p.fileExists('.travis.yml');
});

