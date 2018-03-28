import {EditFunction} from "../../EditFunction";
import {Params} from "../../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";

export class ResetPrimaryKeyToForeignKey extends EditFunction {

    constructor(private mappedByClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const inputHook = "<!-- @Input -->";
        const rawChangeSetColumn = `<changeSet id="change_id_${this.otherClass.toLowerCase()}" author="shboland">
    <renameColumn tableName="${this.otherClass.toUpperCase()}" oldColumnName="id" ` +
            `newColumnName="${this.mappedByClass.toLowerCase()}_id" />
  </changeSet>
  
  ` + inputHook;

        const path = params.databaseModule + "/src/main/db/liquibase/release/" + params.release + "/tables/tables-changelog.xml";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangeSetColumn);
        } else {
            console.error("Changset not added yet!");
        }
    }
}
