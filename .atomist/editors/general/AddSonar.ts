import { File } from "@atomist/rug/model/File";
import { Project } from "@atomist/rug/model/Project";
import { Editor, Parameter, Tags } from "@atomist/rug/operations/Decorators";
import { EditProject } from "@atomist/rug/operations/ProjectEditor";
import { Pattern } from "@atomist/rug/operations/RugOperation";

/**
 * AddSonar editor
 * - Adds sonar cloud settings to travis file
 */
@Editor("AddSonar", "adds sonar cloud settings to travis file")
@Tags("rug", "sonar", "cloud", "travis", "shboland")
export class AddSonar implements EditProject {

    @Parameter({
        displayName: "Github organization",
        description: "Your github organization name",
        pattern: Pattern.any,
        validInput: "name",
        minLength: 0,
        maxLength: 50,
        required: false,
    })
    public githubOrganization: string = "";

    @Parameter({
        displayName: "Sonar token",
        description: "Sonar token of your sonar cloud account",
        pattern: Pattern.any,
        validInput: "token",
        minLength: 0,
        maxLength: 50,
        required: false,
    })
    public sonarToken: string = "";

    public edit(project: Project) {
        const addOnHook = `install:`;
        const addOnInput = `addons:
  sonarcloud:
    organization: ${this.githubOrganization}
    token:
      secure: $SONAR_TOKEN

` + addOnHook;

        const variableHook = `env:
  global:`;
        const variableInput = variableHook + `
    - SONAR_TOKEN=${this.sonarToken}`;

        const scriptHook = `after_script:`;
        const scriptInput =`script:
  - sonar-scanner

` + scriptHook;

        const path = ".travis.yml";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);

            if (!file.contains('- sonar-scanner')) {
                file.replace(addOnHook, addOnInput);
                file.replace(variableHook, variableInput);
                file.replace(scriptHook, scriptInput);
            }
        }
    }
}

export const addSonar = new AddSonar();
