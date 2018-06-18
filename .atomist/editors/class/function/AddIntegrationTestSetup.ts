import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../../functions/FileFunctions";
import { javaFunctions } from "../../functions/JavaClassFunctions";

/**
 * AddIntegrationTestSetup editor
 * - Adds maven dependencies
 * - Adds integration test file setup
 * - Adds integration test utils
 */
@Editor("AddIntegrationTestSetup", "adds setup for integration tests")
@Tags("rug", "integration", "test", "spring", "shboland")
export class AddIntegrationTestSetup implements EditProject {
    @Parameter({
        displayName: "Class name",
        description: "Name of the class we want to add",
        pattern: Pattern.java_class,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public className: string;

    @Parameter({
        displayName: "Base package name",
        description: "Name of the base package in witch we want to add",
        pattern: Pattern.java_package,
        validInput: "Java package name",
        minLength: 0,
        maxLength: 100,
        required: true,
    })
    public basePackage: string;

    @Parameter({
        displayName: "Module name",
        description: "Name of the module we want to add",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "api";

    @Parameter({
        displayName: "Version",
        description: "Version of h2 database",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public h2Version: string = "1.4.194";

    @Parameter({
        displayName: "Version",
        description: "Version of jackson mapper",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public jacksonMapperVersion: string = "1.9.13";


    public edit(project: Project) {

        this.addDependencies(project);
        this.addFailsafePlugin(project);
        this.addIntegrationTestFile(project);
        this.addIntegrationTestUtilsFile(project);
        this.addOrExtendIntegrationTestFactory(project);

    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        // Master pom
        const h2Dependency = `            <dependency>
                <groupId>com.h2database</groupId>
                <artifactId>h2</artifactId>
                <version>\${h2.version}</version>
            </dependency>`;

        const jacksonDependency = `            <dependency>
                <groupId>org.codehaus.jackson</groupId>
                <artifactId>jackson-mapper-asl</artifactId>
                <version>\${jackson.mapper.version}</version>
            </dependency>`;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependencyOfScope("org.springframework.boot", "spring-boot-starter-test", "test");

            pom.addOrReplaceDependencyManagementDependency("com.h2database", "h2", h2Dependency);
            pom.addOrReplaceProperty("h2.version", this.h2Version);

            pom.addOrReplaceDependencyManagementDependency("org.codehaus.jackson", "jackson-mapper-asl", jacksonDependency);
            pom.addOrReplaceProperty("jackson.mapper.version", this.jacksonMapperVersion);
        });

        // Module pom
        const targetFilePath = this.apiModule + "/pom.xml";
        const apiModulePomFile: File = fileFunctions.findFile(project, targetFilePath);

        eng.with<Pom>(apiModulePomFile, "/Pom()", pom => {
            pom.addOrReplaceDependencyOfScope("com.h2database", "h2", "test");
            pom.addOrReplaceDependencyOfScope("org.codehaus.jackson", "jackson-mapper-asl", "test");
        });
    }

    private addFailsafePlugin(project: Project): void {

        const pluginsInput = "</plugins>";
        const rawContent = `
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-failsafe-plugin</artifactId>
                <configuration>
                    <includes>
                        <include>**/*IT.java</include>
                    </includes>
                </configuration>
                <executions>
                    <execution>
                        <id>failsafe-integration-tests</id>
                        <phase>integration-test</phase>
                        <goals>
                            <goal>integration-test</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        ` + pluginsInput;

        const targetFilePath = this.apiModule + "/pom.xml";
        if (project.fileExists(targetFilePath)) {
            const apiModulePomFile: File = fileFunctions.findFile(project, targetFilePath);

            if (!apiModulePomFile.contains("maven-failsafe-plugin")) {
                apiModulePomFile.replace(pluginsInput, rawContent);
            }
        }
    }

    private addIntegrationTestFile(project: Project) {
        const path = this.apiModule + "/src/main/test/java/integration/" + this.className + "ResourceIT.java";
        const rawContent = `package integration;

import org.junit.After;
import org.junit.Before;
import org.junit.runner.RunWith;
import ${this.basePackage}.api.Application;
import ${this.basePackage}.persistence.db.hibernate.bean.${this.className};
import ${this.basePackage}.persistence.db.repo.${this.className}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashSet;
import java.util.Set;


@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = Application.class)
@WebAppConfiguration
@ActiveProfiles("test")
public class ${this.className}ResourceIT {

    private MockMvc mockMvc;
    
    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ${this.className}Repository ${this.className.toLowerCase()}Repository;

    // @InjectInput

    @Before
    public void setupMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @After
    public void tearDown() {
        // @TearDownInputTop
        ${this.className.toLowerCase()}Repository.deleteAll();
        // @TearDownInputBottom
    }

    // @Input

}
`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawContent);
        }
    }

    private addIntegrationTestUtilsFile(project: Project) {
        const path = this.apiModule + "/src/main/test/java/integration/IntegrationTestUtils.java";
        const rawContent = `package integration;

import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.annotate.JsonSerialize;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.io.IOException;
import java.nio.charset.Charset;

public class IntegrationTestUtils {

    private static final MediaType APPLICATION_JSON_UTF8 = new MediaType(
            MediaType.APPLICATION_JSON.getType(),
            MediaType.APPLICATION_JSON.getSubtype(),
            Charset.forName("utf8"));

    public static MockHttpServletRequestBuilder doPost(String resource, Object object) throws Exception {
        return MockMvcRequestBuilders.post(resource)
                .contentType(APPLICATION_JSON_UTF8)
                .content(convertObjectToJsonBytes(object));
    }

    public static MockHttpServletRequestBuilder doPut(String resource, Object object) throws Exception {
        return MockMvcRequestBuilders.put(resource)
                .contentType(APPLICATION_JSON_UTF8)
                .content(convertObjectToJsonBytes(object));
    }

    private static byte[] convertObjectToJsonBytes(Object object) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonSerialize.Inclusion.NON_NULL);
        return mapper.writeValueAsBytes(object);
    }
}
`;
        if (!project.fileExists(path)) {
            project.addFile(path, rawContent);
        }
    }

    private addOrExtendIntegrationTestFactory(project: Project) {
        const path = this.apiModule + "/src/main/test/java/integration/IntegrationTestFactory.java";
        const rawContent = `package integration;
         

public class IntegrationTestFactory {

    // @Input
}
`;
        if (!project.fileExists(path)) {
            project.addFile(path, rawContent);
        }

        const rawMethods = `
    public static ${this.className} givenA${this.className}(${this.className}Repository ${this.className.toLowerCase()}Repository) {
        return givenA${this.className}(${this.className}.builder()
                // @FieldInput${this.className}Bean
                .build(),
                ${this.className.toLowerCase()}Repository);
    }
    
    public static ${this.className} givenA${this.className}(${this.className} ${this.className.toLowerCase()}, ` +
            `${this.className}Repository ${this.className.toLowerCase()}Repository) {
        return ${this.className.toLowerCase()}Repository.save(${this.className.toLowerCase()});
    }
    
    public static Json${this.className} givenAJson${this.className}() {
        return Json${this.className}.builder()
                // @FieldInputJson${this.className}
                .build();
    }
        `;

        const file: File = project.findFile(path);

        if (!file.contains(`givenA${this.className}(`)) {
            const functionInput = "// @Input";

            file.replace(functionInput, functionInput + "\n" + rawMethods);
            javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className);
            javaFunctions.addImport(file, this.basePackage + ".persistence.db.hibernate.bean." + this.className);
            javaFunctions.addImport(file, this.basePackage + ".persistence.db.repo." + this.className + "Repository");
        }
    }
}

export const addIntegrationTestSetup = new AddIntegrationTestSetup();
