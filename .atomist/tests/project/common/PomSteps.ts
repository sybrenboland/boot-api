
import {Project} from "@atomist/rug/model/Project";
import {Given, Then} from "@atomist/rug/test/project/Core";
import {ApiModule, DomainModule, getModule, PersistenceModule} from "./Constants";
import {pomFunctions} from "./PomFunctions";

export const pomFile = "pom.xml";

Given("a boot-api project structure", (p: Project) => {
    p.addFile(pomFile, pomFunctions.basicPomContent());
    p.addFile(ApiModule + "/" + pomFile, pomFunctions.basicPomContent());
    p.addFile(PersistenceModule + "/" + pomFile, pomFunctions.basicPomContent());
    p.addFile(DomainModule + "/" + pomFile, pomFunctions.basicPomContent());
});

Then("new dependency to pom: (.*)$", (p: Project, w, dependency) => {
    return p.fileContains(pomFile, dependency);
});

Then("new dependency to (.*) module pom: (.*)$", (p: Project, w, module, dependency) => {
    return p.fileContains(getModule(module) + "/" + pomFile, dependency);
});
