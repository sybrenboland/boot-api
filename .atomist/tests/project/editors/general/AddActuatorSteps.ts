import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import {ApiModule} from "../../common/Constants";

const manageMentPort = "9999";

When("the AddActuator is run", (p: Project, w: ProjectScenarioWorld) => {

        const editor = w.editor("AddActuator");
        w.editWith(editor, {
            apiModule: ApiModule,
            managementPort: manageMentPort,
        });
    });
