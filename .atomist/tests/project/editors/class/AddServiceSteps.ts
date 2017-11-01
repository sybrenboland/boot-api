
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";
import {ApiModule, BasePackage, ClassName, getModule} from "../../common/Constants";

When("the AddService is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddService");
    w.editWith(editor, {
        className: ClassName,
        basePackage: BasePackage,
        module: ApiModule,
    });
});

Then("a service class is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/service/" + ClassName + "Service.java");
});
