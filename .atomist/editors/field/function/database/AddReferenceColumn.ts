import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {Project} from "@atomist/rug/model/Project";
import {File} from "@atomist/rug/model/File";
import { liquibaseFunctions } from "../../../functions/LiquibaseFunctions";

export class AddReferenceColumn extends EditFunction {

    constructor(private baseClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        liquibaseFunctions.checkRelease(project, params.databaseModule, params.release);

        const inputHook = '<!-- @Input -->';
        const rawChangeSet = `<changeSet id="add_${this.otherClass.toLowerCase()}_` +
            `id_${this.baseClass.toLowerCase()}" author="shboland">
    <addColumn tableName="${this.baseClass.toUpperCase()}">
      <column name="${this.otherClass.toUpperCase()}_ID" type="int" />
    </addColumn>
  </changeSet>
  
` + inputHook;

        const path = params.databaseModule + "/src/main/resources/db/liquibase/release/" + params.release + "/tables/tables-changelog.xml";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangeSet);
        } else {
            console.error("Changset not added yet!");
        }
    }
}
