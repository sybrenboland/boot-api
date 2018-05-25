import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../../editors/functions/FileFunctions";
import {BasePackage, getModule, PersistenceModule} from "../../../common/Constants";

let classNameRepository: string;

When("the AddRepository is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameRepository = classNameInput;

    const editor = w.editor("AddRepository");
    w.editWith(editor, {
        className: classNameRepository,
        basePackage: BasePackage,
        module: PersistenceModule,
    });
});

Then("a repository class is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/" + moduleName.toLowerCase() + "/db/repo/" + classNameRepository + "Repository.java");
});
