import { Project } from "@atomist/rug/model/Project";
import { ProjectScenarioWorld, When } from "@atomist/rug/test/project/Core";

const githubOrganization = "shboland-organization";
const sonarToken = "jsdfijcne9sje9eckes";

When("the AddSonar is run", (p: Project, w: ProjectScenarioWorld) => {

    const editor = w.editor("AddSonar");
    w.editWith(editor, {
        githubOrganization: githubOrganization,
        sonarToken: sonarToken
    });
});
