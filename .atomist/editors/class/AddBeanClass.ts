import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../functions/FileFunctions";
import { liquibaseFunctions } from "../functions/LiquibaseFunctions";

/**
 * AddBeanClass editor
 * - Adds maven dependencies
 * - Adds hibernate bean class
 * - Adds liquibase changeset
 */
@Editor("AddBeanClass", "adds hibernate bean class")
@Tags("rug", "hibernate", "bean", "shboland")
export class AddBeanClass implements EditProject {
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
        displayName: "Persistence module name",
        description: "Name of the module for the persistence objects",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public persistenceModule: string = "persistence";

    @Parameter({
        displayName: "Database module name",
        description: "Name of the module for the database description",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public databaseModule: string = "db";

    @Parameter({
        displayName: "Release",
        description: "Release for with database changes are meant",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public release: string = "1.0.0";

    public edit(project: Project) {

        this.addDependencies(project);
        this.addBeanClass(project, this.persistenceModule + "/src/main");
        this.addChangeSet(project, this.databaseModule + "/src/main/db/liquibase");
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-data-jpa");
        });
    }

    private addBeanClass(project: Project, basePath: string): void {

        const beanPackage = "db.hibernate.bean";
        const rawJavaFileContent = `package ${this.basePackage + "." + beanPackage};

import javax.persistence.*;

@Entity
@Table(name = "${this.className.toUpperCase()}")
public class ${this.className} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;
    
    // @Input
    
}`;
        const path = basePath + "/java/" + fileFunctions.toPath(this.basePackage)
            + "/db/hibernate/bean/" + this.className + ".java";
        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaFileContent);
        }
    }

    private addChangeSet(project: Project, basePath: string): void {

        liquibaseFunctions.checkRelease(project, this.databaseModule, this.release);

        const inputHook = '<!-- @Input -->';
        const rawChangeSetContent = `
    <changeSet id="create_${this.className.toLowerCase()}" author="shboland">
        <createTable tableName="${this.className.toUpperCase()}">
            <column name="id" type="int" autoIncrement="true">
                <constraints primaryKey="true" nullable="false" />
            </column>
        </createTable>
    </changeSet>
  
` + inputHook;

        const path = basePath + "/release/" + this.release + "/tables/tables-changelog.xml";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangeSetContent);
        } else {
            console.error("Changset not added yet!");
        }
    }
}

export const addBeanClass = new AddBeanClass();
