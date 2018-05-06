import {Pom} from "@atomist/rug/model/Pom";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";

/**
 * AddDocker editor
 * - add a Dockerfile
 * - add as build step the image build
 * - extend docker compose file
 */
@Editor("AddDocker", "adds docker containerisation to build")
@Tags("rug", "spring", "docker", "shboland")
export class AddDocker implements EditProject {

    @Parameter({
        displayName: "Base package name",
        description: "Name of the base package in witch we want to add",
        pattern: Pattern.java_package,
        validInput: "Java package name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public basePackage: string  = "org.shboland";

    @Parameter({
        displayName: "Api module name",
        description: "Name of the api module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "api";

    @Parameter({
        displayName: "Docker image prefix",
        description: "Prefix of the docker image",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public dockerImagePrefix: string = "shboland";

    @Parameter({
        displayName: "Version",
        description: "Version of docker plugin",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public dockerPluginVersion: string = "0.4.14";

    @Parameter({
        displayName: "Version",
        description: "Version of the project",
        pattern: Pattern.semantic_version,
        validInput: "a valid semantic version, http://semver.org",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public release: string = "1.0.0";

    @Parameter({
        displayName: "Port number",
        description: "Port on which the service is exposed",
        pattern: Pattern.port,
        validInput: "Port",
        minLength: 0,
        maxLength: 4,
        required: false,
    })
    public port: string = "8888";

    public edit(project: Project) {

        this.addDockerFile(project);
        this.addDockerProperties(project);
        this.addDockerImageBuildStep(project);
        this.extendComposeFile(project);
    }

    private addDockerFile(project: Project) {
        const rawDockerFileContent = `FROM anapsix/alpine-java:8
MAINTAINER shboland <sybboland@gmail.com>

VOLUME /tmp
COPY *.jar app.jar
RUN bash -c 'touch /app.jar'
ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]
`;
        const path = this.apiModule + '/src/main/docker/Dockerfile';
        if (!project.fileExists(path)) {
            project.addFile(path, rawDockerFileContent);
        }
    }

    private addDockerProperties(project: Project) {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceProperty("docker.image.prefix", this.dockerImagePrefix);
            pom.addOrReplaceProperty("docker.plugin.version", this.dockerPluginVersion);
        });
    }

    private addDockerImageBuildStep(project: Project) {
        const inputHook = '</dependencies>';
        const rawChangeSetContent = inputHook + `
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>com.spotify</groupId>
                <artifactId>docker-maven-plugin</artifactId>
                <version>\${docker.plugin.version}</version>
                <executions>
                    <execution>
                        <phase>install</phase>
                        <goals>
                            <goal>build</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <imageName>\${docker.image.prefix}/\${project.artifactId}:\${project.version}</imageName>
                    <dockerDirectory>\${project.basedir}/src/main/docker</dockerDirectory>
                    <resources>
                        <resource>
                            <targetPath>/</targetPath>
                            <directory>\${project.build.directory}</directory>
                            <include>\${project.build.finalName}.jar</include>
                        </resource>
                    </resources>
                </configuration>
            </plugin>
        </plugins>
    </build>
`;

        const path = this.apiModule + "/pom.xml";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);

            if (!file.contains("docker-maven-plugin")) {
                file.replace(inputHook, rawChangeSetContent);
            }
        } else {
            console.error("Pom not added yet!");
        }
    }

    private extendComposeFile(project: Project) {
        const inputHook = 'postgres-container';
        const rawChangeSetContent = `api-service:
    image: ${this.dockerImagePrefix}/${this.apiModule}:${this.release}
    restart: always
    ports:
      - ${this.port}:${this.port}
    environment:
      - SPRING_PROFILES_ACTIVE=production
    links:
      - postgres-container:postgres
  
  ` + inputHook;

        const path = "docker-compose.yml";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);

            if (!file.contains(`${this.dockerImagePrefix}/${this.apiModule}:${this.release}`)) {
                file.replace(inputHook, rawChangeSetContent);
            }
        } else {
            console.error("Compose file not added yet!");
        }
    }
}

export const addDocker = new AddDocker();
