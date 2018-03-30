import { Project } from "@atomist/rug/model/Project";
import { ProjectScenarioWorld, When, Then } from "@atomist/rug/test/project/Core";
import { ApiModule, BasePackage, getModule } from "../../common/Constants";

const version = '1.2.3';
const port = '8881';
const dockerImagePrefix = 'prefix';
const dockerPluginVersion = '0.4.14';

When("the AddDocker is run", (p: Project, w: ProjectScenarioWorld) => {

    const editor = w.editor("AddDocker");
    w.editWith(editor, {
        basePackage: BasePackage,
        apiModule: ApiModule,
        dockerImagePrefix: dockerImagePrefix,
        dockerPluginVersion: dockerPluginVersion,
        version: version,
        port: port
    });
});

Then("a dockerfile is added to the (.*) module$", (p: Project, w, module) => {
    return p.fileExists(getModule(module) + "/src/main/docker/Dockerfile");
});

Then("the docker compose file contains the new service$", (p: Project, w) => {
    return p.fileContains("docker-compose.yml", dockerImagePrefix);
});
