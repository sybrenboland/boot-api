import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Given, ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {javaFunctions} from "../../../../editors/functions/JavaClassFunctions";

const pathToClass = "src/main/java/org/shboland/service/Bean.java";
const rawJavaClass = `package org.shboland.bean;

import javax.persistence.*;

public class Adres {

    private String name;
    
    // @Input
    
}`;

const newFunctionName = "toClient";
const newFunction = `    public JsonOpgave toClient(Opgave opgave) {
        return new JsonOpgave();
    }`;
const newAnnotation = "@Sybren";
const newImport = "org.shboland.Style";

Given("a java class", (p: Project, w: ProjectScenarioWorld) => {
    p.addFile(pathToClass, rawJavaClass);
});

When("the addFunction is run", (p: Project, w: ProjectScenarioWorld) => {
    const javaClass: File = p.findFile(pathToClass);
    javaFunctions.addFunction(javaClass, newFunctionName, newFunction);
});

When("the addAnnotation is run", (p: Project, w: ProjectScenarioWorld) => {
    const javaClass: File = p.findFile(pathToClass);
    javaFunctions.addAnnotationToClass(javaClass, newAnnotation);
});

When("the addImport is run", (p: Project, w: ProjectScenarioWorld) => {
    const javaClass: File = p.findFile(pathToClass);
    javaFunctions.addImport(javaClass, newImport);
});

Then("the class contains the new function", (p: Project, w) => {
    return p.fileContains(pathToClass, newFunctionName);
});

Then("the class contains the new annotation", (p: Project, w) => {
    return p.fileContains(pathToClass, newAnnotation);
});

Then("the class contains the new import", (p: Project, w) => {
    return p.fileContains(pathToClass, "import " + newImport);
});
