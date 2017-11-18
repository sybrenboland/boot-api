import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage} from "../../common/Constants";

When("the AddPOST is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    const editor = w.editor("AddPOST");
    w.editWith(editor, {
        className: classNameInput,
        basePackage: BasePackage,
        module: ApiModule,
    });
});
