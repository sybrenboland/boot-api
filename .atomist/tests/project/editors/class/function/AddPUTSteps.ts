import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import { ApiModule, BasePackage, CoreModule } from "../../../common/Constants";

When("the AddPUT is run with className \"([^\"]*)\"", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    const editor = w.editor("AddPUT");
    w.editWith(editor, {
        className: classNameInput,
        basePackage: BasePackage,
        apiModule: ApiModule,
        coreModule: CoreModule
    });
});
