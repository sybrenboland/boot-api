import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Given, ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";

const filePath = "src/main/java/org/shboland/service/ServiceFile.txt";
let file: File;

Given("a file exists", (p: Project, w: ProjectScenarioWorld) => {
    p.addFile(filePath, "service properties");
});

When("the findFile is run", (p: Project, w: ProjectScenarioWorld) => {
    file = fileFunctions.findFile(p, filePath);
});

Then("the file is returned", (p: Project, w) => {
    return file.path === filePath;
});

Then("the package is now a path", (p: Project, w) => {
    return fileFunctions.toPath("org.mycompany.service.component") === "org/mycompany/service/component";
});
