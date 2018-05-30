import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When, Then} from "@atomist/rug/test/project/Core";
import { ApiModule, BasePackage } from "../../../common/Constants";

const h2Version = "1.4.194";
const jacksonMapperVersion = "1.9.13";

When("the AddIntegrationTestSetup is run for class \"([^\"]*)\"", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    const editor = w.editor("AddIntegrationTestSetup");
    w.editWith(editor, {
        className: classNameInput,
        basePackage: BasePackage,
        apiModule: ApiModule,
        h2Version: h2Version,
        jacksonMapperVersion: jacksonMapperVersion,
    });
});

Then("the bean \"([^\"]*)\" has an integration test file", (p: Project, w, className: string) => {
    return p.fileExists(ApiModule + "/src/test/java/integration/" + className + "ResourceIT.java");
});

Then("a integration test util file has been added", (p: Project, w) => {
    return p.fileContains(
        ApiModule + "/src/test/java/integration/IntegrationTestUtils.java",
        "convertObjectToJsonBytes");
});


