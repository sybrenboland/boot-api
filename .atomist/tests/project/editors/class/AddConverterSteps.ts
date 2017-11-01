
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";
import {ApiModule, BasePackage, ClassName} from "../../common/Constants";

const converterPath = ApiModule + "/src/main/java/"
    + fileFunctions.toPath(BasePackage) + "/convert/" + ClassName + "Converter.java";

When("the AddConverter is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddConverter");
    w.editWith(editor, {
        className: ClassName,
        basePackage: BasePackage,
        module: ApiModule,
    });
});

Then("a converter class is added to the api module", (p: Project, w) => {
    return p.fileExists(converterPath);
});

Then("the converter class contains a method: (.*)", (p: Project, w, methodName: string) => {
    return p.fileContains(converterPath, methodName);
});
