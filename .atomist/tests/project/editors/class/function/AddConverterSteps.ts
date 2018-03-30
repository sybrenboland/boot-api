import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../../editors/functions/FileFunctions";
import {ApiModule, BasePackage} from "../../../common/Constants";

let classNameConverter: string;
let converterPath: string;

When("the AddConverter is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameConverter = classNameInput;
    converterPath = ApiModule + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/convert/" + classNameConverter + "Converter.java";

    const editor = w.editor("AddConverter");
    w.editWith(editor, {
        className: classNameConverter,
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
