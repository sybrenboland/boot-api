import {File} from "@atomist/rug/model/File";
import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {Project} from "@atomist/rug/model/Project";
import { liquibaseFunctions } from "../../../functions/LiquibaseFunctions";


export class AddCombinationTableChangeSet extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        liquibaseFunctions.checkRelease(project, params.databaseModule, params.release);

        const inputHook = '<!-- @Input -->';
        const rawChangeSet = `<changeSet id="create_${this.oneClass.toLowerCase()}_${this.otherClass.toLowerCase()}" author="shboland">
    <createTable tableName="${this.oneClass.toUpperCase()}_${this.otherClass.toUpperCase()}">
      <column name="${this.oneClass.toLowerCase()}_id" type="int" >
        <constraints nullable="false" />
      </column>
      <column name="${this.otherClass.toLowerCase()}_id" type="int" >
        <constraints nullable="false" />
      </column>
    </createTable>
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
