import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";

export class FileFunctions {

    public findFile(project: Project, pathToFile: string): File {
        const file: File = project.findFile(pathToFile);
        if (file === null) {
            console.error("File not found with path: " + pathToFile);
        }

        return file;
    }

    public toPath(packageName: string) {
        return packageName.replace(/\./gi, "/");
    }
}

export const fileFunctions = new FileFunctions();
