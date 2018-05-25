import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../../../editors/functions/FileFunctions";
import {BasePackage, DomainModule} from "../../../common/Constants";

let classNameDomainClass: string;
const jacksonVersion = "2.9.0";

When("the AddDomainClass is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameDomainClass = classNameInput;

    const editor = w.editor("AddDomainClass");
    w.editWith(editor, {
        className: classNameDomainClass,
        basePackage: BasePackage,
        module: DomainModule,
        version: jacksonVersion,
    });
});

Then("a domain class is added", (p: Project, w) => {
    return p.fileExists("domainModule/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/domain/entities/Json" + classNameDomainClass + ".java");
});
