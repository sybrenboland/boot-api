import {Project} from "@atomist/rug/model/Project";
import {Then} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../editors/functions/FileFunctions";
import {BasePackage, getModule, PersistenceModule, Release} from "./Constants";

Then("the (.*) module contains (.*) properties in (.*)",
    (p: Project, w, module: string, configSubject: string, configFile: string) => {
        return p.fileContains(getModule(module) + "/src/main/resources/" + configFile, configSubject);
});

Then("the name (.*) is added to class (.*) in package (.*) of the (.*) module",
    (p: Project, w, name: string, className: string, packageName: string, moduleName: string) => {
        return p.fileContains(getModule(moduleName) + "/src/main/java/" + fileFunctions.toPath(BasePackage)
            + "/" + fileFunctions.toPath(packageName) + "/" + className + ".java", name);
});

Then("the name (.*) is not added to class (.*) in package (.*) of the (.*) module",
    (p: Project, w, name: string, className: string, packageName: string, moduleName: string) => {
        return !p.fileContains(getModule(moduleName) + "/src/main/java/" + fileFunctions.toPath(BasePackage)
            + "/" + fileFunctions.toPath(packageName) + "/" + className + ".java", name);
    });

Then("the changelog is extended with (.*) of class (.*)", (p: Project, w, name: string, className: string) => {
    const path = PersistenceModule + "/src/main/resources/liquibase/release/" + Release + "/db-1-"
        + className.toLowerCase() + ".xml";

    return p.fileContains(path, name.toUpperCase());
});

Then("the combination changelog is extended with (.*) of class (.*) and class (.*)",
    (p: Project, w, name: string, otherClassName: string, baseClassName: string) => {
    const path = PersistenceModule + "/src/main/resources/liquibase/release/" + Release + "/db-2-"
        + otherClassName.toLowerCase() + "-" + baseClassName.toLowerCase() + ".xml";

    return p.fileContains(path, name.toUpperCase());
});
