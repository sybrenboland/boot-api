import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {BasePackage, PersistenceModule, Release} from "../../common/Constants";

let classNameBean: string;
const mavenBasePath = "/src/main";
const beanPath = PersistenceModule + mavenBasePath + "/java/org/shboland/db/hibernate/bean/Adres.java";
const changelogPath = PersistenceModule + mavenBasePath + "/resources/liquibase/release/"
    + Release + "/db-1-adres.xml";

When("the AddBeanClass is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameBean = classNameInput;

    const editor = w.editor("AddBeanClass");
    w.editWith(editor, {
        className: classNameBean,
        basePackage: BasePackage,
        module: PersistenceModule,
        release: Release,
    });
});

Then("the project has new bean", (p: Project, w) => {
    return p.fileExists(beanPath);
});

Then("the bean has the given name", (p: Project, w) => {
    return p.fileContains(beanPath, classNameBean);
});

Then("a changelog has been added", (p: Project, w) => {
    return p.fileExists(changelogPath);
});

Then("the changelog has the right name", (p: Project, w) => {
    return p.fileContains(changelogPath, "create_adres");
});
