import { Project } from "@atomist/rug/model/Project";
import { Then } from "@atomist/rug/test/project/Core";
import { getModule } from "./Constants";

export const pomFile = "pom.xml";

Then("new dependency to pom: (.*)$", (p: Project, w, dependency: string) => {
    return p.fileContains(pomFile, dependency);
});

Then("new dependency to (.*) module pom: (.*)$", (p: Project, w, module, dependency) => {
    return p.fileContains(getModule(module) + "/" + pomFile, dependency);
});
