import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage, DomainModule, getModule, PersistenceModule, Release} from "../../common/Constants";
import {fileFunctions} from "../../../../editors/functions/FileFunctions";

let classNameField: string;
let fieldNameField: string;

When("the AddField is run for class (.*) with field (.*) with type (.*)",
    (p: Project, w: ProjectScenarioWorld, classNameInput: string, fieldNameInput: string, typeInput: string) => {
    classNameField = classNameInput;
    fieldNameField = fieldNameInput;

    const editor = w.editor("AddField");
    w.editWith(editor, {
        fieldName: fieldNameInput,
        type: typeInput,
        className: classNameField,
        basePackage: BasePackage,
        apiModule: ApiModule,
        domainModule: DomainModule,
        persistenceModule: PersistenceModule,
        release: Release,
    });
});

Then("the converter is extended with the field", (p: Project, w) => {
    const path = ApiModule + "/src/main/java/org/shboland/convert/" + classNameField + "Converter.java";

    return p.fileContains(path, fieldNameField.charAt(0).toUpperCase() + fieldNameField.slice(1));
});

Then("a DateParam class is added to the (.*) module", (p: Project, w, moduleName: string) => {
    return p.fileExists(getModule(moduleName) + "/src/main/java/"
        + fileFunctions.toPath(BasePackage) + "/domain/utility/DateParam.java");
});
