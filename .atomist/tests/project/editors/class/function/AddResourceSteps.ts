import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../../editors/functions/FileFunctions";
import {ApiModule, BasePackage} from "../../../common/Constants";

let classNameResource: string;

When("the AddResource is run with className \"([^\"]*)\"", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameResource = classNameInput;

    const editor = w.editor("AddResource");
    w.editWith(editor, {
        className: classNameResource,
        basePackage: BasePackage,
        module: ApiModule,
    });
});

Then("a resource class is added", (p: Project, w) => {
    return p.fileExists("apiModule/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/api/resource/" + classNameResource + "Controller.java");
});

Then("a resource interface is added", (p: Project, w) => {
    return p.fileExists("apiModule/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/api/resource/I" + classNameResource + "Controller.java");
});
