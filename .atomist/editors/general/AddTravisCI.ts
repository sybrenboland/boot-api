import { Project } from "@atomist/rug/model/Project";
import { Editor, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";

/**
 * AddTravisCI editor
 * - add a travis config file
 */
@Editor("AddTravisCI", "adds travis config file to root directory")
@Tags("rug", "travis", "CI", "shboland")
export class AddTravisCI implements EditProject {

    public edit(project: Project) {

        const rawTravisFileContent = `sudo: required

language: java
jdk: oraclejdk8

cache:
  directories:
  - "$HOME/.m2"

install:
  - mvn clean install
`;
        const path = '.travis.yml';
        if (!project.fileExists(path)) {
            project.addFile(path, rawTravisFileContent);
        }
    }
}

export const addTravisCI = new AddTravisCI();
