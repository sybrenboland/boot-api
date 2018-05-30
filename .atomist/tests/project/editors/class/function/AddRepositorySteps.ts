import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../../editors/functions/FileFunctions";
import {BasePackage, PersistenceModule} from "../../../common/Constants";

let classNameRepository: string;

When("the AddRepository is run with className \"([^\"]*)\"", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameRepository = classNameInput;

    const editor = w.editor("AddRepository");
    w.editWith(editor, {
        className: classNameRepository,
        basePackage: BasePackage,
        module: PersistenceModule,
    });
});

Then("a repository class is added", (p: Project, w) => {
    return p.fileExists("persistenceModule/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/persistence/db/repo/" + classNameRepository + "Repository.java");
});
