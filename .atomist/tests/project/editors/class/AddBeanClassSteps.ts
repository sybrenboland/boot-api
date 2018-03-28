import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import { BasePackage, DatabaseModule, PersistenceModule, Release } from "../../common/Constants";

let classNameBean: string;
const mavenBasePath = "/src/main";
const beanPath = PersistenceModule + mavenBasePath + "/java/org/shboland/db/hibernate/bean/Adres.java";
const changelogPath = DatabaseModule + mavenBasePath + "/db/liquibase/release/" + Release + "/changelog.xml";

When("the AddBeanClass is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    classNameBean = classNameInput;

    const editor = w.editor("AddBeanClass");
    w.editWith(editor, {
        className: classNameBean,
        basePackage: BasePackage,
        persistenceModule: PersistenceModule,
        databaseModule: DatabaseModule,
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
