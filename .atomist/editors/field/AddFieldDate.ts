import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../functions/JavaClassFunctions";

export class DateFieldFunctions {

    private fieldName: string;
    private type: string;
    private className: string;
    private basePackage: string;
    private persistenceModule: string;
    private apiModule: string;
    private domainModule: string;

    public addDateField(fieldName: string, type: string, className: string, basePackage: string,
                        persistenceModule: string, apiModule: string, domainModule: string,
                        project: Project, basePath: string) {
        this.fieldName = fieldName;
        this.type = type;
        this.className = className;
        this.basePackage = basePackage;
        this.persistenceModule = persistenceModule;
        this.apiModule = apiModule;
        this.domainModule = domainModule;

        this.addFieldToBean(project, basePath);
        this.addFieldToDomainClass(project, basePath);
        this.addFieldToConverter(project, basePath);
        this.addFieldToJsonSearchCriteria(project, basePath);
        this.addFieldToSearchCriteriaConverter(project, basePath);
    }

    private addFieldToBean(project: Project, basePath: string) {
        const inputHook = "// @Input";
        let rawJavaCode = `@Column(name = "${this.fieldName.toUpperCase()}")
    private ${this.type} ${this.fieldName};
    
    ` + inputHook;

        const beanPath = this.persistenceModule + basePath + "/db/hibernate/bean/" + this.className + ".java";
        const beanFile: File = project.findFile(beanPath);
        rawJavaCode = `@Convert(converter = LocalDateTimeAttributeConverter.class)
    ` + rawJavaCode;

        const importConverter = this.basePackage + ".db.hibernate.converter.LocalDateTimeAttributeConverter";
        javaFunctions.addImport(beanFile, importConverter);
        javaFunctions.addImport(beanFile, "java.time.LocalDateTime");

        this.addConverter(project, basePath, this.type, "Timestamp");


        if (project.fileExists(beanPath)) {
            beanFile.replace(inputHook, rawJavaCode);
        } else {
            console.error("Bean class not added yet!");
        }
    }

    private addFieldToDomainClass(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const path = this.domainModule + basePath + "/domain/Json" + this.className + ".java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            const rawJavaCode = `@JsonProperty("${this.fieldName}")
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

            javaFunctions.addImport(file, "com.fasterxml.jackson.annotation.JsonProperty");
            javaFunctions.addImport(file, "lombok.AccessLevel");
            javaFunctions.addImport(file, "lombok.AllArgsConstructor");
            javaFunctions.addAnnotationToClass(file, "@AllArgsConstructor(access = AccessLevel.PRIVATE)");

            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("Domain class not added yet!");
        }
    }

    private addFieldToConverter(project: Project, basePath: string) {
        const path = this.apiModule + basePath + "/convert/" + this.className + "Converter.java";
        const file: File = project.findFile(path);

        const inputJsonHook = "// @InputJsonField";
        const rawJsonInput = `.${this.fieldName}(${this.className.toLowerCase()}` +
            `.get${javaFunctions.capitalize(this.fieldName)}() != null ? ${this.className.toLowerCase()}` +
            `.get${javaFunctions.capitalize(this.fieldName)}().atZone(ZoneId.of("UTC")) : null)
                ` + inputJsonHook;

        const inputBeanHook = "// @InputBeanField";
        const rawBeanInput = `.${this.fieldName}(json${this.className}` +
            `.get${javaFunctions.capitalize(this.fieldName)}() != null ? json${this.className}` +
            `.get${javaFunctions.capitalize(this.fieldName)}().to${this.type}() : null)
                ` + inputBeanHook;

        javaFunctions.addImport(file, "java.time.ZoneId");

        if (project.fileExists(path)) {
            file.replace(inputJsonHook, rawJsonInput);
            file.replace(inputBeanHook, rawBeanInput);
        } else {
            console.error("Converter not added yet!");
        }
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

    private addFieldToJsonSearchCriteria(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `@QueryParam("${this.fieldName}")
    private DateParam ${this.fieldName}Param;
    
    ` + inputHook;

        const path = this.domainModule + basePath + "/domain/Json" + this.className + "SearchCriteria.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(inputHook, rawJavaCode);
            javaFunctions.addImport(file, this.basePackage + ".domain.utility.DateParam");
        } else {
            console.error("JsonSearchCriteria class not added yet!");
        }

        this.addDateParamClass(project, basePath);
    }

    private addFieldToSearchCriteriaConverter(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `DateParam ${this.fieldName}Param = ` +
            `json${this.className}SearchCriteria.get${javaFunctions.capitalize(this.fieldName)}Param();
        searchCriteriaBuilder.${this.fieldName}` +
            `(${this.fieldName}Param != null ? parseLocalDateTime(${this.fieldName}Param) : Optional.empty());
    
    ` + inputHook;

        const path = this.apiModule + basePath + "/convert/" + this.className + "SearchCriteriaConverter.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(inputHook, rawJavaCode);
            javaFunctions.addImport(file, this.basePackage + ".domain.utility.DateParam");
            javaFunctions.addImport(file, "java.time.LocalDateTime");
            javaFunctions.addImport(file, "java.util.Date");
            javaFunctions.addImport(file, "java.time.ZoneId");
            javaFunctions.addImport(file, "java.text.ParseException");

            this.addDateParseFunction(project, path);
        } else {
            console.error("SearchCriteriaConverter class not added yet!");
        }
    }

    private addDateParamClass(project: Project, basePath: string) {
        const rawJavaConverterInput = `package ${this.basePackage}.domain.utility;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class DateParam {

    private String dateString;

    public DateParam(String dateString) {
        this.dateString = dateString;
    }

    public Date parseDate() throws ParseException {
        final SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mmZ");
        format.setLenient(false);

        return format.parse(dateString);
    }
}
`;

        const path = this.domainModule + basePath + "/domain/utility/DateParam.java";

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaConverterInput);
        }
    }

    private addDateParseFunction(project: Project, path: string) {
        const functionInputHook = "// @Function input";
        const rawFunctionCode = `private static Optional<LocalDateTime> parseLocalDateTime(DateParam dateParam) {
        try {
            Date date = dateParam.parseDate();
            return Optional.of(LocalDateTime.ofInstant(date.toInstant(), ZoneId.of("UTC")));
        } catch (ParseException e) {
            throw new ConvertException("Date parameters should be formatted as 'yyyy-MM-dd'T'HH:mmZ'", e);
        }
    }
    ` + functionInputHook;

        const file: File = project.findFile(path);

        if (project.fileExists(path) && !project.fileContains(path, "parseLocalDateTime(DateParam dateParam)")) {
            file.replace(functionInputHook, rawFunctionCode);
        } else {
            console.error("SearchCriteriaConverter class not added yet!");
        }
    }
}

export const dateFieldFunctions = new DateFieldFunctions();
