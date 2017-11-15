
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage, ClassName, DomainModule, PersistenceModule, Release} from "../../common/Constants";

const fieldNameInput = "street";

When("the AddField is run for type (.*)", (p: Project, w: ProjectScenarioWorld, typeInput: string) => {
    const editor = w.editor("AddField");
    w.editWith(editor, {
        fieldName: fieldNameInput,
        type: typeInput,
        className: ClassName,
        basePackage: BasePackage,
        apiModule: ApiModule,
        domainModule: DomainModule,
        persistenceModule: PersistenceModule,
        release: Release,
    });
});

Then("the changelog is extended with the field", (p: Project, w) => {
    const path = PersistenceModule + "/src/main/resources/liquibase/release/" + Release + "/db-"
        + ClassName.toLowerCase() + ".xml";

    return p.fileContains(path, fieldNameInput.toUpperCase());
});

Then("the converter is extended with the field", (p: Project, w) => {
    const path = ApiModule + "/src/main/java/org/shboland/convert/" + ClassName + "Converter.java";

    return p.fileContains(path, fieldNameInput.charAt(0).toUpperCase() + fieldNameInput.slice(1));
});
