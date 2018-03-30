import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage, DomainModule, getModule, PersistenceModule} from "../../../common/Constants";
import {fileFunctions} from "../../../../../editors/functions/FileFunctions";

const mavenBasePath = "/src/main/java/";

When("the AddSearchCriteria is run with className (.*)", (p: Project, w: ProjectScenarioWorld, classNameInput: string) => {
    const editor = w.editor("AddSearchCriteria");
    w.editWith(editor, {
        className: classNameInput,
        basePackage: BasePackage,
        persistenceModule: PersistenceModule,
        apiModule: ApiModule,
        domainModule: DomainModule,
    });
});

Then("a (.*) is added to (.*) module in package (.*)",
    (p: Project, w, javaClassName: string, moduleName: string, packageName: string) => {

        const pathToClass = getModule(moduleName) + mavenBasePath + fileFunctions.toPath(BasePackage)
            + "/" + fileFunctions.toPath(packageName) + "/" + javaClassName + ".java";

        return p.fileExists(pathToClass);
    });
