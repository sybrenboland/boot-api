
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";
import {ApiModule, BasePackage, getModule} from "../../common/Constants";
import {pomFile} from "../../common/PomSteps";

const springBootVersion = "1.5.7.RELEASE";

When("the AddSpringBoot is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddSpringBoot");
    w.editWith(editor, {
        basePackage: BasePackage,
        apiModule: ApiModule,
        version: springBootVersion,
    });
});

Then("the parent of the master pom is spring boot", (p: Project, w) => {
    return p.fileContains(pomFile, "spring-boot-starter-parent") && p.fileContains(pomFile, springBootVersion);
});

Then("an application class is added to the \"([^\"]*)\" module", (p: Project, w, moduleName: string) => {

    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/" +  moduleName.toLowerCase() + "/Application.java");
});
