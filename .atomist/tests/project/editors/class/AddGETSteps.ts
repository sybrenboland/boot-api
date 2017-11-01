import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage, ClassName} from "../../common/Constants";

When("the AddGET is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddGET");
    w.editWith(editor, {
        className: ClassName,
        basePackage: BasePackage,
        module: ApiModule,
    });
});
