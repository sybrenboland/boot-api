import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../../functions/FileFunctions";

/**
 * AddConverter editor
 * - Adds converter shell class
 */
@Editor("AddConverter", "adds converter class")
@Tags("rug", "api", "convert", "shboland")
export class AddConverter implements EditProject {
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
        required: false,
    })
    public basePackage: string = "org.shboland";

    @Parameter({
        displayName: "Module name",
        description: "Name of the module we want to add",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public module: string = "api";

    public edit(project: Project) {
        const basePath = this.module + "/src/main/java/" + fileFunctions.toPath(this.basePackage);

        this.addDependencies(project);
        this.addConverterClass(project, basePath);
        this.addUnitTest(project);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-hateoas");
        });
    }

    private addConverterClass(project: Project, basePath: string): void {

        const rawJavaFileContent = `package ${this.basePackage}.api.convert;

import ${this.basePackage}.persistence.db.hibernate.bean.${this.className};
import ${this.basePackage}.domain.entities.Json${this.className};
import ${this.basePackage}.api.resource.${this.className}Controller;
import org.springframework.stereotype.Service;

import static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo;

@Service
public class ${this.className}Converter {
    
    public Json${this.className} toJson(${this.className} ${this.className.toLowerCase()}) {
        Json${this.className} json${this.className} = Json${this.className}.builder()
                // @InputJsonField
                .build();
        
        json${this.className}.add(linkTo(${this.className}Controller.class)` +
            `.slash(${this.className.toLowerCase()}.getId()).withSelfRel());
        // @InputLink

        return json${this.className};
    }
    
    public ${this.className} fromJson(Json${this.className} json${this.className}) {
        return ${this.className.toLowerCase()}Builder(json${this.className}).build();
    }

    public ${this.className} fromJson(Json${this.className} json${this.className}, ` +
            `long ${this.className.toLowerCase()}Id) {
        return ${this.className.toLowerCase()}Builder(json${this.className})
                .id(${this.className.toLowerCase()}Id)
                .build();
    }

    private ${this.className}.${this.className}Builder ${this.className.toLowerCase()}Builder(` +
            `Json${this.className} json${this.className}) {

        return ${this.className}.builder()
                // @InputBeanField
        ;
    }
}`;

        const pathConverter = basePath + "/api/convert/" + this.className + "Converter.java";
        if (!project.fileExists(pathConverter)) {
            project.addFile(pathConverter, rawJavaFileContent);
        }
    }

    private addUnitTest(project: Project) {

        const rawJavaFileContent = `package ${this.basePackage}.api.convert;

import org.junit.Before;
import org.junit.Test;
import ${this.basePackage}.domain.entities.Json${this.className};
import ${this.basePackage}.persistence.db.hibernate.bean.${this.className};

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class ${this.className}ConverterTest {

    private ${this.className}Converter ${this.className.toLowerCase()}Converter = new ${this.className}Converter();

    private static final Long ID = 3L;

    private ${this.className} ${this.className.toLowerCase()};
    private Json${this.className} json${this.className};

    @Before
    public void setUp() {

        this.${this.className.toLowerCase()} = ${this.className}.builder()
                // @InputTestField
                .build();

        this.json${this.className} = Json${this.className}.builder()
                // @InputJsonTestField
                .build();
    }

    @Test
    public void testToJson() {

        Json${this.className} resultJson${this.className} = ${this.className.toLowerCase()}Converter.toJson(${this.className.toLowerCase()});

        assertNotNull("No object returned.", resultJson${this.className});
        // @InputAssertJsonField
    }

    @Test
    public void testFromJson() {

        ${this.className} result${this.className} = ${this.className.toLowerCase()}Converter.fromJson(json${this.className});

        assertNotNull("No object returned.", result${this.className});
        // @InputAssertField
    }

    @Test
    public void testFromJson_WithId() {

        ${this.className} result${this.className} = ${this.className.toLowerCase()}${this.className.toLowerCase()}Converter.fromJson(json${this.className}, ID);

        assertNotNull("No object returned.", result${this.className});
        assertEquals("Field not set correctly.", ID, result${this.className}.getId());
        // @InputAssertField
    }
}`;

        const pathConverterUnitTest = this.module + "/src/main/test/java/" + fileFunctions.toPath(this.basePackage) + "/api/convert/" + this.className + "ConverterTest.java";
        if (!project.fileExists(pathConverterUnitTest)) {
            project.addFile(pathConverterUnitTest, rawJavaFileContent);
        }
    }
}

export const addConverter = new AddConverter();
