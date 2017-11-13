
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

Then("the bean is extended with the field", (p: Project, w) => {
    const path = PersistenceModule + "/src/main/java/org/shboland/db/hibernate/bean/" + ClassName + ".java";

    return p.fileContains(path, fieldNameInput);
});

Then("the domain class is extended with the field", (p: Project, w) => {
    const path = DomainModule + "/src/main/java/org/shboland/domain/Json" + ClassName + ".java";

    return p.fileContains(path, fieldNameInput);
});

Then("the converter is extended with the field", (p: Project, w) => {
    const path = ApiModule + "/src/main/java/org/shboland/convert/" + ClassName + "Converter.java";

    return p.fileContains(path, fieldNameInput.charAt(0).toUpperCase() + fieldNameInput.slice(1));
});

Then("a (.*) annotation was added on the bean field", (p: Project, w, annotation: string) => {
    const path = PersistenceModule + "/src/main/java/org/shboland/db/hibernate/bean/" + ClassName + ".java";

    return p.fileContains(path, annotation);
});

Then("a (.*) annotation was added on the domain field", (p: Project, w, annotation: string) => {
    const path = DomainModule + "/src/main/java/org/shboland/domain/Json" + ClassName + ".java";

    return p.fileContains(path, annotation);
});
