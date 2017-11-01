
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";
import {ApiModule, BasePackage, ClassName, getModule} from "../../common/Constants";

When("the AddResource is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddResource");
    w.editWith(editor, {
        className: ClassName,
        basePackage: BasePackage,
        module: ApiModule,
    });
});

Then("a resource class is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/resource/" + ClassName + "Controller.java");
});

Then("a resource interface is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/resource/I" + ClassName + "Controller.java");
});
