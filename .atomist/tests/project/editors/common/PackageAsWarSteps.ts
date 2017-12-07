import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage} from "../../common/Constants";

When("the PackageAsWar is run", (p: Project, w: ProjectScenarioWorld) => {

        const editor = w.editor("PackageAsWar");
        w.editWith(editor, {
            basePackage: BasePackage,
            apiModule: ApiModule,
        });
    });
