
import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage, ClassName, PersistenceModule} from "../../common/Constants";

const releaseInput = "2.0.0";

const mavenBasePath = "/src/main";
const beanPath = PersistenceModule + mavenBasePath + "/java/org/shboland/db/hibernate/bean/Adres.java";
const changelogPath = PersistenceModule + mavenBasePath + "/resources/liquibase/release/"
    + releaseInput + "/db-adres.xml";

When("the AddBeanClass is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddBeanClass");
    w.editWith(editor, {
        className: ClassName,
        basePackage: BasePackage,
        module: PersistenceModule,
        release: releaseInput,
    });
});

Then("the project has new bean", (p: Project, w) => {
    return p.fileExists(beanPath);
});

Then("the bean has the given name", (p: Project, w) => {
    return p.fileContains(beanPath, ClassName);
});

Then("a changelog has been added", (p: Project, w) => {
    return p.fileExists(changelogPath);
});

Then("the changelog has the right name", (p: Project, w) => {
    return p.fileContains(changelogPath, "create_adres");
});
