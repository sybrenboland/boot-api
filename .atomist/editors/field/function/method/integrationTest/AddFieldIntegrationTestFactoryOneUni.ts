import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { Project } from "@atomist/rug/model/Project";

export class AddFieldIntegrationTestFactoryOneUni extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        const pathFactory = params.apiModule + "/src/main/test/java/integration/IntegrationTestFactory.java";
        if (project.fileExists(pathFactory)) {
            const file: File = project.findFile(pathFactory);

            const fieldInputHook = `// @FieldInput${this.oneClass}Bean`;
            const rawFieldInput = ` .${this.otherClass.toLowerCase()}(${this.otherClass}.builder().build())
                ` + fieldInputHook;

            file.replace(fieldInputHook, rawFieldInput);
        } else {
            console.error("Integration test factory class not added yet!");
        }
    }
}
