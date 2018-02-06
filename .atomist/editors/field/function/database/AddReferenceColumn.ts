import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {Project} from "@atomist/rug/model/Project";
import {File} from "@atomist/rug/model/File";

export class AddReferenceColumn extends EditFunction {

    constructor(private baseClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "<!-- @Input -->";
        const rawChangeSetColumn = `<changeSet id="add_${this.otherClass.toLowerCase()}_` +
            `id_${this.baseClass.toLowerCase()}" author="shboland">
    <addColumn tableName="${this.baseClass.toUpperCase()}">
      <column name="${this.otherClass.toUpperCase()}_ID" type="int" />
    </addColumn>
  </changeSet>
  
  ` + inputHook;

        const path = params.persistenceModule + "/src/main/resources/liquibase/release/"
            + params.release + "/db-1-" + this.baseClass.toLowerCase() + ".xml";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangeSetColumn);
        } else {
            console.error("Changset not added yet!");
        }
    }
}