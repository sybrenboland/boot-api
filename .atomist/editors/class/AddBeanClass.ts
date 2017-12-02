import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {fileFunctions} from "../functions/FileFunctions";

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
        displayName: "Module name",
        description: "Name of the module we want to add",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public module: string = "persistence";

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

        const basePath = this.module + "/src/main";

        this.addDependencies(project);
        this.addBeanClass(project, basePath);
        this.addChangeSet(project, basePath);
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

        const rawChangesetContent = `<databaseChangeLog xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
                        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-3.4.xsd">
 
  <changeSet id="create_${this.className.toLowerCase()}" author="shboland">
    <createTable tableName="${this.className.toUpperCase()}">
      <column name="id" type="int" autoIncrement="true">
        <constraints primaryKey="true" nullable="false" />
      </column>
    </createTable>
  </changeSet>
  
  <!-- @Input -->
</databaseChangeLog>`;


        const path = basePath + "/resources/liquibase/release/" + this.release + "/db-1-"
            + this.className.toLowerCase() + ".xml";
        if (!project.fileExists(path)) {
            project.addFile(path, rawChangesetContent);
        }
    }
}

export const addBeanClass = new AddBeanClass();
