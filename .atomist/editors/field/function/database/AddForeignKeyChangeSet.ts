import {File} from "@atomist/rug/model/File";
import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {Project} from "@atomist/rug/model/Project";
import { liquibaseFunctions } from "../../../functions/LiquibaseFunctions";


export class AddForeignKeyChangeSet extends EditFunction {

    constructor(private baseClass: string, private baseColumn: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        liquibaseFunctions.checkRelease(project, params.databaseModule, params.release);

        const inputHook = '<!-- @Input -->';
        const rawChangeSet = `<changeSet id="add_foreignkey_${this.otherClass.toLowerCase()}_${this.baseClass.toLowerCase()}" author="shboland" >
        <addForeignKeyConstraint baseColumnNames="${this.baseColumn.toUpperCase()}"
                                 baseTableName="${this.baseClass.toUpperCase()}"
                                 constraintName="FK_${this.otherClass.toUpperCase()}_${this.baseClass.toUpperCase()}"
                                 referencedColumnNames="ID"
                                 referencedTableName="${this.otherClass.toUpperCase()}"/>
    </changeSet>
    
` + inputHook;

        const path = params.databaseModule + "/src/main/resources/db/liquibase/release/" + params.release +
            "/constraints/foreign-key/fk-changelog.xml";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangeSet);
        } else {
            console.error("Changset not added yet!");
        }
    }
}
