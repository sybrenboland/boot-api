
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";
import {BasePackage, ClassName, DomainModule, getModule} from "../../common/Constants";

const jacksonVersion = "2.9.0";

When("the AddDomainClass is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddDomainClass");
    w.editWith(editor, {
        className: ClassName,
        basePackage: BasePackage,
        module: DomainModule,
        version: jacksonVersion,
    });
});

Then("a domain class is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/domain/Json" + ClassName + ".java");
});
