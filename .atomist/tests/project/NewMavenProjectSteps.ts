import { File } from "@atomist/rug/model/File";
import { Project } from "@atomist/rug/model/Project";
import {
    Given, ProjectScenarioWorld, Then, When,
} from "@atomist/rug/test/project/Core";

When("NewMavenProject is run", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    const generator = w.generator("NewMavenProject");
    w.generateWith(generator, "NewMaven", {});
});

Then("the pom file exists", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    return p.fileExists("pom.xml");
});

Then("the pom has right artifactId", (p: Project, world) => {
    const w = world as ProjectScenarioWorld;
    let pom: File = p.findFile("pom.xml");
    return pom.contains("spring-boot-api");
});
