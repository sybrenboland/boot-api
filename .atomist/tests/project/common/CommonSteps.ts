import {Project} from "@atomist/rug/model/Project";
import {Then} from "@atomist/rug/test/project/Core";
import {fileFunctions} from "../../../editors/functions/FileFunctions";
import { ApiModule, BasePackage, DatabaseModule, getModule, Release } from "./Constants";

Then("the README contains info about (.*)",
    (p: Project, w, name: string) => {
        return p.fileContains("README.md", name);
    });

Then("the (.*) module contains (.*) properties in (.*)",
    (p: Project, w, module: string, configSubject: string, configFile: string) => {
        return p.fileContains(getModule(module) + "/src/main/resources/" + configFile, configSubject);
});

Then("the name (.*) is added to (.*) class of the (.*) module",
    (p: Project, w, name: string, className: string, moduleName: string) => {
        return p.fileContains(getModule(moduleName) + "/src/main/java/" + fileFunctions.toPath(BasePackage) + "/" + moduleName.toLowerCase()
        + "/" + className + ".java", name);
    });

Then("the name (.*) is added to class (.*) in package (.*) of the (.*) module",
    (p: Project, w, name: string, className: string, packageName: string, moduleName: string) => {
    return p.fileContains(getModule(moduleName) + "/src/main/java/" + fileFunctions.toPath(BasePackage) +
        "/" + fileFunctions.toPath(packageName) + "/" + className + ".java", name);
});

Then("the name (.*) is not added to class (.*) in package (.*) of the (.*) module",
    (p: Project, w, name: string, className: string, packageName: string, moduleName: string) => {
        return !p.fileContains(getModule(moduleName) + "/src/main/java/" + fileFunctions.toPath(BasePackage) +
            "/" + fileFunctions.toPath(packageName) + "/" + className + ".java", name);
    });

Then("the name (.*) is added to configuration file (.*) of module (.*)",
    (p: Project, w, name: string, fileName: string, moduleName: string) => {
        return p.fileContains(getModule(moduleName) + "/src/main/resources/" + fileName + ".yml", name);
    });

Then("the changelog is extended with (.*)", (p: Project, w, name: string) => {
    const path = DatabaseModule + "/src/main/resources/db/liquibase/release/" + Release + "/tables/tables-changelog.xml";

    return p.fileContains(path, name.toUpperCase());
});

Then("the combination changelog is extended with (.*)", (p: Project, w, name: string) => {
    const path = DatabaseModule + "/src/main/resources/db/liquibase/release/" + Release +
        "/constraints/foreign-key/fk-changelog.xml";

    return p.fileContains(path, name.toUpperCase());
});

Then("the test (.*) is added to the integration tests of class (.*)", (p: Project, w, testName: string, className: string) => {
        return p.fileContains(ApiModule + "/src/test/java/integration/" + className + "ResourceIT.java", testName);
});

Then("the test (.*) is not added to the integration tests of class (.*)", (p: Project, w, testName: string, className: string) => {
    return !p.fileContains(ApiModule + "/src/test/java/integration/" + className + "ResourceIT.java", testName);
});
