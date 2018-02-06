import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {Project} from "@atomist/rug/model/Project";


export class AddForeignKeyChangeSet extends EditFunction {

    constructor(private baseClass: string, private baseColumn: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawChangeSet = `<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.4.xsd">

    <changeSet id="add_foreignkey_${this.otherClass.toLowerCase()}_${this.baseClass.toLowerCase()}" author="shboland" >
        <addForeignKeyConstraint baseColumnNames="${this.baseColumn.toUpperCase()}"
                                 baseTableName="${this.baseClass.toUpperCase()}"
                                 constraintName="FK_${this.otherClass.toUpperCase()}_${this.baseClass.toUpperCase()}"
                                 referencedColumnNames="ID"
                                 referencedTableName="${this.otherClass.toUpperCase()}"/>
    </changeSet>
</databaseChangeLog>`;

        const pathChangeset = params.persistenceModule + "/src/main/resources/liquibase/release/" + params.release + "/db-2-"
            + this.otherClass.toLowerCase() + "-" + this.baseClass.toLowerCase() + ".xml";

        if (!project.fileExists(pathChangeset)) {
            project.addFile(pathChangeset, rawChangeSet);
        }
    }
}