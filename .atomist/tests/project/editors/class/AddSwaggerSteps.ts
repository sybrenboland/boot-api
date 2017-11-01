
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage} from "../../common/Constants";

const swaggerVersion = "2.3.0";

When("the AddSwagger is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddSwagger");
    w.editWith(editor, {
        basePackage: BasePackage,
        apiModule: ApiModule,
        version: swaggerVersion,
    });
});
