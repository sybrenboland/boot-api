import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {Project} from "@atomist/rug/model/Project";


export class AddCombinationTableChangeSet extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawChangeSet = `<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.4.xsd">
 
  <changeSet id="create_${this.oneClass.toLowerCase()}_${this.otherClass.toLowerCase()}" author="shboland">
    <createTable tableName="${this.oneClass.toUpperCase()}_${this.otherClass.toUpperCase()}">
      <column name="${this.oneClass.toLowerCase()}_id" type="int" >
        <constraints nullable="false" />
      </column>
      <column name="${this.otherClass.toLowerCase()}_id" type="int" >
        <constraints nullable="false" />
      </column>
    </createTable>
  </changeSet>

</databaseChangeLog>
`;

        const path = params.persistenceModule + "/src/main/resources/liquibase/release/" + params.release + "/db-1-"
            + this.oneClass.toLowerCase() + "-" + this.otherClass.toLowerCase() + ".xml";

        if (!project.fileExists(path)) {
            project.addFile(path, rawChangeSet);
        }
    }
}