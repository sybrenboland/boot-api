import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {javaFunctions} from "../functions/JavaClassFunctions";
import {fileFunctions} from "../functions/FileFunctions";

/**
 * AddField editor
 * - Adds chain from persistence to api for a bean
 */
@Editor("AddField", "Add whole api to persistence chain")
@Tags("rug", "api", "persistence", "domain", "shboland")
export class AddField implements EditProject {
    @Parameter({
        displayName: "Class name",
        description: "Name of the class we want to add",
        pattern: Pattern.any,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public fieldName: string;

    @Parameter({
        displayName: "Class name",
        description: "Name of the class we want to add",
        pattern: Pattern.any,
        validInput: "Java class name",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public type: string;

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
        description: "Name of the persistence module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public persistenceModule: string = "persistence";

    @Parameter({
        displayName: "Module name",
        description: "Name of the api module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "api";

    @Parameter({
        displayName: "Module name",
        description: "Name of the domain module",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public domainModule: string = "domain";

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

        const basePath = "/src/main/java/" + fileFunctions.toPath(this.basePackage);

        this.addChangelog(project);
        this.addFieldToBean(project, basePath);
        this.addFieldToDomainObject(project, basePath);
        this.addFieldToConverter(project, basePath);
    }

    private addChangelog(project: Project) {
        const inputHook = "<!-- @Input -->";
        const rawChangSet = `<changeSet id="add_${this.fieldName}_${this.className.toLowerCase()}" author="shboland">
    <addColumn tableName="${this.className.toUpperCase()}">
      <column name="${this.fieldName.toUpperCase()}" type="${this.convertToDbType(this.type)}" />
    </addColumn>
  </changeSet>
  
  ` + inputHook;

        const path = this.persistenceModule + "/src/main/resources/liquibase/release/"
            + this.release + "/db-" + this.className.toLowerCase() + ".xml";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChangSet);
        } else {
            console.error("Changset not added yet!");
        }
    }

    private addFieldToBean(project: Project, basePath: string) {
        const inputHook = "// @Input";
        let rawJavaCode = `@Column(name = "${this.fieldName.toUpperCase()}")
    private ${this.type} ${this.fieldName};
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.className + ".java";
        const beanFile: File = project.findFile(beanPath);

        if (this.type === "LocalDateTime") {
            rawJavaCode = `@Convert(converter = LocalDateTimeAttributeConverter.class)
    ` + rawJavaCode;

            const importConverter = this.basePackage + ".db.hibernate.converter.LocalDateTimeAttributeConverter";
            javaFunctions.addImport(beanFile, importConverter);
            javaFunctions.addImport(beanFile, "java.time.LocalDateTime");

            this.addConverter(project, basePath, this.type, "Timestamp");
        }

        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class not added yet!");
        }
    }

    private addFieldToDomainObject(project: Project, basePath: string) {
        const inputHook = "// @Input";
        let rawJavaCode = `@JsonProperty("${this.fieldName}")
    private ${this.type} ${this.fieldName};

    ` + inputHook;

        const path = this.domainModule + basePath + "/domain/Json" + this.className + ".java";
        const file: File = project.findFile(path);

        if (this.type === "LocalDateTime") {
            rawJavaCode = `@JsonProperty("${this.fieldName}")
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    private ZonedDateTime ${this.fieldName};

    ` + inputHook;

            javaFunctions.addImport(file, "java.time.ZonedDateTime");
            javaFunctions.addImport(file, "com.fasterxml.jackson.databind.annotation.JsonDeserialize");
            javaFunctions.addImport(file, "com.fasterxml.jackson.databind.annotation.JsonSerialize");

            this.addDateTimeSerializer(project, basePath);
            javaFunctions.addImport(file, this.basePackage + ".domain.utility.CustomDateTimeSerializer");
            this.addDateTimeDeserializer(project, basePath);
            javaFunctions.addImport(file, this.basePackage + ".domain.utility.CustomDateTimeDeserializer");
            this.addInvalidDateException(project, basePath);
        }

        if (project.fileExists(path)) {
            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("Domain class not added yet!");
        }
    }

    private addFieldToConverter(project: Project, basePath: string) {
        const inputJsonHook = "// @InputJsonField";
        let rawJsonInput = `json${this.className}.set${this.capitalize(this.fieldName)}` +
            `(${this.className.toLowerCase()}.get${this.capitalize(this.fieldName)}());
        ` + inputJsonHook;

        const inputBeanHook = "// @InputBeanField";
        let rawBeanInput = `${this.className.toLowerCase()}To.set${this.capitalize(this.fieldName)}` +
            `(${this.className.toLowerCase()}From.get${this.capitalize(this.fieldName)}());
        ` + inputBeanHook;

        const path = this.apiModule + basePath + "/convert/" + this.className + "Converter.java";
        const file: File = project.findFile(path);

        if (this.type === "LocalDateTime") {
            rawJsonInput = `if (${this.className.toLowerCase()}.get${this.capitalize(this.fieldName)}() != null) {
            json${this.className}.set${this.capitalize(this.fieldName)}(${this.className.toLowerCase()}.` +
                `get${this.capitalize(this.fieldName)}().atZone(ZoneId.of("UTC")));
        }
        ` + inputJsonHook;

            rawBeanInput = `if (${this.className.toLowerCase()}From.get${this.capitalize(this.fieldName)}() != null) {
            ${this.className.toLowerCase()}To.set${this.capitalize(this.fieldName)}` +
                `(${this.className.toLowerCase()}From.get${this.capitalize(this.fieldName)}().to${this.type}());
        }
        ` + inputBeanHook;

            javaFunctions.addImport(file, "java.time.ZoneId");
        }

        if (project.fileExists(path)) {
            file.replace(inputJsonHook, rawJsonInput);
            file.replace(inputBeanHook, rawBeanInput);
        } else {
            console.error("Converter not added yet!");
        }
    }

    private convertToDbType(javaType: string) {
        let dbType: string;
        switch (javaType) {
            case "String":
                dbType = "varchar(255)";
                break;
            case "int":
            case "long":
                dbType = "BIGINT";
                break;
            case "boolean":
                dbType = "BOOLEAN";
                break;
            case "LocalDateTime":
                dbType = "DATETIME";
                break;
        }

        return dbType;
    }

    private capitalize(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    private addConverter(project: Project, basePath: string, javaType: string, dbType: string) {
        const rawJavaConverterInput = `package ` + this.basePackage + `.db.hibernate.converter;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.sql.` + dbType + `;
import java.time.` + javaType + `;

@Converter(autoApply = true)
public class ` + javaType + `AttributeConverter implements AttributeConverter<` + javaType + `, ` + dbType + `> {

    @Override
    public ` + dbType + ` convertToDatabaseColumn(` + javaType + ` locDate) {
        return locDate == null ? null : ` + dbType + `.valueOf(locDate);
    }

    @Override
    public ` + javaType + ` convertToEntityAttribute(` + dbType + ` sql` + dbType + `) {
        return sql` + dbType + ` == null ? null : sql` + dbType + `.to` + javaType + `();
    }
}
`;

        const converterPath = this.persistenceModule + basePath +
            "/db/hibernate/converter/LocalDateTimeAttributeConverter.java";

        if (!project.fileExists(converterPath)) {
            project.addFile(converterPath, rawJavaConverterInput);
        }
    }

    private addDateTimeSerializer(project: Project, basePath: string) {
        const rawJavaInput = `package ` + this.basePackage + `.domain.utility;

import java.io.IOException;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

public class CustomDateTimeSerializer extends JsonSerializer<ZonedDateTime> {

    @Override
    public void serialize(final ZonedDateTime value, final JsonGenerator jgen, final SerializerProvider provider)
            throws IOException {
        final DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mmZ");
        final String dateString = value.format(dateFormat);
        jgen.writeString(dateString);
    }
}
`;

        const path = this.domainModule + basePath + "/domain/utility/CustomDateTimeSerializer.java";

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaInput);
        }
    }

    private addDateTimeDeserializer(project: Project, basePath: string) {
        const rawJavaInput = `package ` + this.basePackage + `.domain.utility;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

public class CustomDateTimeDeserializer extends JsonDeserializer<ZonedDateTime> {

    @Override
    public ZonedDateTime deserialize(final JsonParser parser, final DeserializationContext ctxt) throws IOException {

        final String date = parser.getText();

        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mmZ");
        format.setLenient(false);

        try {
            return ZonedDateTime.ofInstant(format.parse(date).toInstant(), ZoneId.of("UTC"));
        } catch (final ParseException e) {
            final String msg = "Invalid date value: " + date;
            throw new InvalidDateException(msg, e);
        }
    }
}
`;

        const path = this.domainModule + basePath + "/domain/utility/CustomDateTimeDeserializer.java";

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaInput);
        }
    }

    private addInvalidDateException(project: Project, basePath: string) {
        const rawJavaInput = `package ` + this.basePackage + `.domain.utility;

class InvalidDateException extends RuntimeException {

    InvalidDateException(final String msg, final Throwable cause) {
        super(msg, cause);
    }
}
`;

        const path = this.domainModule + basePath + "/domain/utility/InvalidDateException.java";

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaInput);
        }
    }
}

export const addField = new AddField();
