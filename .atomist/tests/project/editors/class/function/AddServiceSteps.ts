import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../../editors/functions/FileFunctions";
import { BasePackage, CoreModule, getModule } from "../../../common/Constants";

let classNameService: string;

When("the AddService is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameService = classNameInput;

    const editor = w.editor("AddService");
    w.editWith(editor, {
        className: classNameService,
        basePackage: BasePackage,
        module: CoreModule,
    });
});

Then("a service class is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/" +  moduleName.toLowerCase() + "/service/" + classNameService + "Service.java");
});
