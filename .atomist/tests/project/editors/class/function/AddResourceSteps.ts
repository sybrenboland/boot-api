import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../../editors/functions/FileFunctions";
import {ApiModule, BasePackage, getModule} from "../../../common/Constants";

let classNameResource: string;

When("the AddResource is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameResource = classNameInput;

    const editor = w.editor("AddResource");
    w.editWith(editor, {
        className: classNameResource,
        basePackage: BasePackage,
        module: ApiModule,
    });
});

Then("a resource class is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/resource/" + classNameResource + "Controller.java");
});

Then("a resource interface is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/resource/I" + classNameResource + "Controller.java");
});
