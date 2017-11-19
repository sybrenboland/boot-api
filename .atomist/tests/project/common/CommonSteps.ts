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
    const path = PersistenceModule + "/src/main/resources/liquibase/release/" + Release + "/db-"
        + className.toLowerCase() + ".xml";

    return p.fileContains(path, name.toUpperCase());
});
