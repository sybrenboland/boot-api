import { Project } from "@atomist/rug/model/Project";
import { ProjectScenarioWorld, Then, When } from "@atomist/rug/test/project/Core";
import { ApiModule } from "../../common/Constants";

const liquibaseVersionInput = "3.5.2";
const postgresVersionInput = "9.1-901.jdbc3";

When("the AddLiquibase is run", (p: Project, w: ProjectScenarioWorld) => {
    const editor = w.editor("AddLiquibase");
    w.editWith(editor, {
        apiModule: ApiModule,
        liquibaseVersion: liquibaseVersionInput,
        postgresVersion: postgresVersionInput,
    });
});

Then("a docker-compose file for the database setup is added", (p: Project, w) => {
        return p.fileExists("docker-compose.yml");
});
