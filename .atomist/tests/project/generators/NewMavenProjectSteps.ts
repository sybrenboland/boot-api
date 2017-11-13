import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, Then, When} from "@atomist/rug/test/project/Core";
import {ApiModule, DomainModule, PersistenceModule} from "../common/Constants";

const artifactIdInput = "new-api";
const groupIdInput = "shboland";
const versionInput = "1.2.1";

When("the NewMavenProject is run", (p: Project, w: ProjectScenarioWorld) => {
    const generator = w.generator("NewMavenProject");
    w.generateWith(generator, artifactIdInput,{
        artifactId: artifactIdInput,
        groupId: groupIdInput,
        version: versionInput,
        apiModuleName: ApiModule,
        persistenceModuleName: PersistenceModule,
        domainModuleName: DomainModule,
    });
});

Then("the master pom has the given (.*)", (p: Project, w, searchText: string) => {
    return p.fileContains("pom.xml", searchText);
});