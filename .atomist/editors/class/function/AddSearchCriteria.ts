import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {javaFunctions} from "../../functions/JavaClassFunctions";
import {fileFunctions} from "../../functions/FileFunctions";
import { unitTestFunctions } from "../../functions/UnitTestFunctions";

/**
 * AddGET editor
 * - Adds maven dependencies
 * - Adds method to resource class and interface
 * - Adds method to service
 * - Adds method to converter
 *
 * Requires:
 * - Bean class
 * - Domain class
 * - Resource class and interface
 * - Service class
 * - Repository
 */
@Editor("AddSearchCriteria", "adds REST get method")
@Tags("rug", "api", "SearchCriteria", "shboland")
export class AddSearchCriteria implements EditProject {
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
        displayName: "Core apiModule name",
        description: "Name of the apiModule with the business logic",
        pattern: Pattern.any,
        validInput: "Just a name",
        minLength: 1,
        maxLength: 50,
        required: false,
    })
    public coreModule: string = "core";

    @Parameter({
        displayName: "Version",
        description: "Version of resteasy",
        pattern: Pattern.any,
        validInput: "Release number",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public restEasyVersion: string = "3.0.12.Final";

    public edit(project: Project) {

        const basePath = "/src/main/java/" + fileFunctions.toPath(this.basePackage);

        this.addDependencies(project);

        this.addJsonSearchResult(project, basePath);
        this.addJsonSearchCriteria(project, basePath);
        this.addSearchCriteria(project, basePath);
        this.addSearchCriteriaConverter(project, basePath);
        this.addConversionException(project, basePath);
        this.addSearchCriteriaConverterUnitTest(project);

        this.addResourceInterfaceMethod(project, basePath);
        this.addResourceMethod(project, basePath);
        this.addResourceClassMethodUnitTest(project);
        this.addServiceMethodSearch(project, basePath);
        this.addServiceMethodSearchUnitTest(project);
        this.addServiceMethodCount(project, basePath);
        this.addServiceMethodCountUnitTest(project);

        this.addCustomRepository(project, basePath);
        this.addCustomRepositoryImplementation(project, basePath);
        this.addTestConfigurationPersistenceModule(project);
        this.addCustomRepositoryImplementationUnitTest(project);
        this.addAbstractRepository(project, basePath);
        this.extendRepository(project, basePath);

        this.addIntegrationTests(project);
    }

    private addDependencies(project: Project): void {
        // Master pom
        const restEasyDependency = `            <dependency>
                <groupId>org.jboss.resteasy</groupId>
                <artifactId>jaxrs-api</artifactId>
                <version>\${jaxrs.api.version}</version>
            </dependency>`;

        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependencyManagementDependency(
                "org.jboss.resteasy",
                "jaxrs-api",
                restEasyDependency,
            );
            pom.addOrReplaceProperty("jaxrs.api.version", this.restEasyVersion);
        });

        // Domainmodule pom
        const targetDomainFilePath = this.domainModule + "/pom.xml";
        const domainModulePomFile: File = fileFunctions.findFile(project, targetDomainFilePath);

        eng.with<Pom>(domainModulePomFile, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.jboss.resteasy", "jaxrs-api");
        });

        // Apimodule pom
        const targetApiFilePath = this.apiModule + "/pom.xml";
        const apiModulePomFile: File = fileFunctions.findFile(project, targetApiFilePath);

        eng.with<Pom>(apiModulePomFile, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.projectlombok", "lombok");
        });
    }

    private addJsonSearchResult(project: Project, basePath: string) {
        const path = this.domainModule + basePath + "/domain/entities/JsonSearchResult.java";
        const rawJavaContent = `package ${this.basePackage}.domain.entities;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@JsonInclude(value = Include.NON_NULL)
public class JsonSearchResult<T> {

    @JsonProperty("grandTotal")
    private Integer grandTotalNumberOfResults;

    @JsonProperty("numberOfResults")
    private Integer numberOfResults;

    @JsonProperty("results")
    private List<T> results;

}
`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addJsonSearchCriteria(project: Project, basePath: string) {
        const path = this.domainModule + basePath + "/domain/entities/Json" + this.className + "SearchCriteria.java";
        const rawJavaContent = `package ${this.basePackage}.domain.entities;

import javax.ws.rs.QueryParam;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Getter
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class Json${this.className}SearchCriteria {

    private static final int DEFAULT_MAX_RESULTS = 10;

    @QueryParam("maxResults")
    private int maxResults = DEFAULT_MAX_RESULTS;

    @QueryParam("start")
    private int start;

    @QueryParam("id")
    private Long id;
    
    // @Input

}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addSearchCriteria(project: Project, basePath: string) {
        const path = this.persistenceModule + basePath + "/persistence/criteria/" + this.className + "SearchCriteria.java";
        const rawJavaContent = `package ${this.basePackage}.persistence.criteria;

import java.util.Optional;

import lombok.Getter;
import lombok.Builder;

@Getter
@Builder
public class ${this.className}SearchCriteria {

    @Builder.Default
    private int maxResults = 10;

    @Builder.Default
    private int start = 0;

    @Builder.Default
    private Optional<Long> id = Optional.empty();
    
    // @Input
}
`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addSearchCriteriaConverter(project: Project, basePath: string) {
        const path = this.apiModule + basePath + "/api/convert/" + this.className + "SearchCriteriaConverter.java";
        const rawJavaContent = `package ${this.basePackage}.api.convert;

import ${this.basePackage}.domain.entities.Json${this.className}SearchCriteria;
import ${this.basePackage}.persistence.criteria.${this.className}SearchCriteria;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("${javaFunctions.lowercaseFirst(this.className)}SearchCriteriaConverter")
public class ${this.className}SearchCriteriaConverter {

    public ${this.className}SearchCriteria createSearchCriteria` +
            `(Json${this.className}SearchCriteria json${this.className}SearchCriteria) {
        ${this.className}SearchCriteria.${this.className}SearchCriteriaBuilder searchCriteriaBuilder = ` +
            `${this.className}SearchCriteria.builder();

        searchCriteriaBuilder.start(json${this.className}SearchCriteria.getStart());
        if (json${this.className}SearchCriteria.getMaxResults() > 0) {
            searchCriteriaBuilder.maxResults(json${this.className}SearchCriteria.getMaxResults());
        } else {
            throw new ConvertException("Maximum number of results should be a positive number.");
        }

        Long id = json${this.className}SearchCriteria.getId();
        searchCriteriaBuilder.id(Optional.ofNullable(id));
        
        // @Input

        return searchCriteriaBuilder.build();
    }
    
    // @Function input
}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addSearchCriteriaConverterUnitTest(project: Project) {

        const rawJavaFileContent = `package ${this.basePackage}.api.convert;

import org.junit.Before;
import org.junit.Test;
import ${this.basePackage}.domain.entities.Json${this.className}SearchCriteria;
import ${this.basePackage}.persistence.criteria.${this.className}SearchCriteria;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;
import static org.junit.Assert.assertTrue;

public class ${this.className}SearchCriteriaConverterTest {

    private ${this.className}SearchCriteriaConverter ${this.className.toLowerCase()}SearchCriteriaConverter = new ${this.className}SearchCriteriaConverter();

    private static final int MAX_RESULTS = 5;
    private static final int START = 1;
    private static final Long ID = 2L;

    private Json${this.className}SearchCriteria json${this.className}SearchCriteria;

    @Before
    public void setUp() {

        json${this.className}SearchCriteria = Json${this.className}SearchCriteria.builder()
                .start(START)
                .id(ID)
                // @FieldInput
                .build();
    }

    @Test
    public void testCreateSearchCriteria_NotPositiveMaxResults() {

        json${this.className}SearchCriteria = json${this.className}SearchCriteria.toBuilder()
                .maxResults(0)
                .build();

        try {
            ${this.className.toLowerCase()}SearchCriteriaConverter.createSearchCriteria(json${this.className}SearchCriteria);
            fail("An exception should be thrown!");
        } catch (ConvertException exception) {
            assertEquals("Wrong message returned!", "Maximum number of results should be a positive number.", exception.getMessage());
        }
    }

    @Test
    public void testCreateSearchCriteria() {

        json${this.className}SearchCriteria = json${this.className}SearchCriteria.toBuilder()
                .maxResults(MAX_RESULTS)
                .build();

        ${this.className}SearchCriteria resultSearchCriteria = ${this.className.toLowerCase()}SearchCriteriaConverter
                .createSearchCriteria(json${this.className}SearchCriteria);

        assertNotNull("No object returned!", resultSearchCriteria);
        assertEquals("Field not set correctly!", MAX_RESULTS, resultSearchCriteria.getMaxResults());
        assertEquals("Field not set correctly!", START, resultSearchCriteria.getStart());
        assertTrue("Field not set correctly!", resultSearchCriteria.getId().isPresent());
        assertEquals("Field not set correctly!", ID, resultSearchCriteria.getId().get());
        // @AssertInput
    }

    // @Input

}
`;

        const pathConverterUnitTest = this.apiModule + "/src/main/test/java/" + fileFunctions.toPath(this.basePackage) + "/api/convert/" + this.className + "SearchCriteriaConverterTest.java";
        if (!project.fileExists(pathConverterUnitTest)) {
            project.addFile(pathConverterUnitTest, rawJavaFileContent);
        }
    }

    private addResourceInterfaceMethod(project: Project, basePath: string) {
        const rawJavaMethod = `    
    @RequestMapping(path = "", method = RequestMethod.GET)
    ResponseEntity<JsonSearchResult> list(@BeanParam Json${this.className}SearchCriteria searchCriteria);`;

        const path = this.apiModule + basePath + "/api/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "list", rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className + "SearchCriteria");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.JsonSearchResult");
        javaFunctions.addImport(file, "javax.ws.rs.BeanParam");
    }

    private addResourceMethod(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    public ResponseEntity<JsonSearchResult> list(@BeanParam Json${this.className}SearchCriteria searchCriteria) {

        ${this.className}SearchCriteria sc;
        try {
            sc = ${javaFunctions.lowercaseFirst(this.className)}SearchCriteriaConverter.createSearchCriteria(searchCriteria);
        } catch (ConvertException e) {
            log.warn("Conversion failed!", e);
            return ResponseEntity.badRequest().build();
        }

        List<${this.className}> ${this.className.toLowerCase()}List = new ArrayList<>();
        int numberOf${this.className} = ${this.className.toLowerCase()}Service.findNumberOf${this.className}(sc);
        if (numberOf${this.className} > 0) {
            ${this.className.toLowerCase()}List = ${this.className.toLowerCase()}Service.findBySearchCriteria(sc);
        }

        JsonSearchResult<Json${this.className}> result = JsonSearchResult.<Json${this.className}>builder()
                .results(${this.className.toLowerCase()}List.stream()` +
            `.map(${this.className.toLowerCase()}Converter::toJson).collect(Collectors.toList()))
                .numberOfResults(${this.className.toLowerCase()}List.size())
                .grandTotalNumberOfResults(numberOf${this.className})
                .build();

        return ResponseEntity.ok(result);
    }`;

        const path = this.apiModule + basePath + "/api/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "list", rawJavaMethod);

        javaFunctions.addToConstructor(
            file,
            this.className + "Controller",
            this.className + "SearchCriteriaConverter",
            javaFunctions.lowercaseFirst(this.className) + "SearchCriteriaConverter");
        javaFunctions.addImport(file, this.basePackage + ".api.convert." + this.className + "SearchCriteriaConverter");

        javaFunctions.addAnnotationToClass(file, "@Slf4j");
        javaFunctions.addImport(file, "lombok.extern.slf4j.Slf4j");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.Json" + this.className + "SearchCriteria");
        javaFunctions.addImport(file, this.basePackage + ".domain.entities.JsonSearchResult");
        javaFunctions.addImport(file, this.basePackage + ".api.convert.ConvertException");
        javaFunctions.addImport(file, this.basePackage + ".persistence.criteria." + this.className + "SearchCriteria");
        javaFunctions.addImport(file, "java.util.ArrayList");
        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, "javax.ws.rs.BeanParam");
        javaFunctions.addImport(file, "java.util.stream.Collectors");
    }

    private addResourceClassMethodUnitTest(project: Project) {

        const rawJavaMethod = `
    
    @Test
    public void testList_ConversionException() {

        when(${this.className.toLowerCase()}SearchCriteriaConverter.createSearchCriteria(json${this.className}SearchCriteria)).thenThrow(new ConvertException("Conversion fail"));

        ResponseEntity response = ${this.className.toLowerCase()}Controller.list(json${this.className}SearchCriteria);

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.BAD_REQUEST.value(), response.getStatusCodeValue());
        verify(${this.className.toLowerCase()}Service, never()).findNumberOf${this.className}(any());
    }

    @Test
    public void testList_Zero${this.className}sFound() {

        when(${this.className.toLowerCase()}SearchCriteriaConverter.createSearchCriteria(json${this.className}SearchCriteria)).thenReturn(${this.className.toLowerCase()}SearchCriteria);
        when(${this.className.toLowerCase()}Service.findNumberOf${this.className}(${this.className.toLowerCase()}SearchCriteria)).thenReturn(0);

        ResponseEntity response = ${this.className.toLowerCase()}Controller.list(json${this.className}SearchCriteria);

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
        assertTrue("Returned object of wrong type!", response.getBody() instanceof JsonSearchResult);
        JsonSearchResult jsonSearchResult = (JsonSearchResult) response.getBody();
        assertEquals("Wrong object returned!", new Integer(0), jsonSearchResult.getGrandTotalNumberOfResults());
        assertEquals("Wrong object returned!", new Integer(0), jsonSearchResult.getNumberOfResults());
        assertTrue("Wrong object returned!", jsonSearchResult.getResults().isEmpty());
        verify(${this.className.toLowerCase()}Service, never()).findBySearchCriteria(any());
    }

    @Test
    public void testList_Multiple${this.className}sFound() {

        when(${this.className.toLowerCase()}SearchCriteriaConverter.createSearchCriteria(json${this.className}SearchCriteria)).thenReturn(${this.className.toLowerCase()}SearchCriteria);
        when(${this.className.toLowerCase()}Service.findNumberOf${this.className}(${this.className.toLowerCase()}SearchCriteria)).thenReturn(1);
        when(${this.className.toLowerCase()}Service.findBySearchCriteria(${this.className.toLowerCase()}SearchCriteria)).thenReturn(Collections.singletonList(${this.className.toLowerCase()}));
        when(${this.className.toLowerCase()}Converter.toJson(${this.className.toLowerCase()})).thenReturn(json${this.className});

        ResponseEntity response = ${this.className.toLowerCase()}Controller.list(json${this.className}SearchCriteria);

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.OK.value(), response.getStatusCodeValue());
        assertTrue("Returned object of wrong type!", response.getBody() instanceof JsonSearchResult);
        JsonSearchResult jsonSearchResult = (JsonSearchResult) response.getBody();
        assertEquals("Wrong object returned!", new Integer(1), jsonSearchResult.getGrandTotalNumberOfResults());
        assertEquals("Wrong object returned!", new Integer(1), jsonSearchResult.getNumberOfResults());
        assertEquals("Wrong object returned!", 1, jsonSearchResult.getResults().size());
        assertEquals("Wrong object returned!", json${this.className}, jsonSearchResult.getResults().get(0));
    }`;

        const pathControllerUnitTest = this.apiModule + "/src/main/test/java/" + fileFunctions.toPath(this.basePackage) + "/api/resource/" + this.className + "ControllerTest.java";
        if (!project.fileExists(pathControllerUnitTest)) {
            unitTestFunctions.basicUnitTestController(project, pathControllerUnitTest, this.className, this.basePackage);
        }

        const file: File = project.findFile(pathControllerUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.className + 'Service');
        unitTestFunctions.addMock(file, this.className + 'Converter');
        unitTestFunctions.addMock(file, this.className + 'SearchCriteriaConverter');
        unitTestFunctions.addLongParameter(file, `${this.className.toUpperCase()}_ID`);
        unitTestFunctions.addBeanParameter(file, this.className);
        unitTestFunctions.addBeanParameter(file, 'Json' + this.className);
        unitTestFunctions.addBeanParameter(file, `Json${this.className}SearchCriteria`);
        unitTestFunctions.addBeanParameter(file, `${this.className}SearchCriteria`);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, "java.util.Collections");
        javaFunctions.addImport(file, `${this.basePackage}.persistence.db.hibernate.bean.${this.className}`);
        javaFunctions.addImport(file, `${this.basePackage}.domain.entities.Json${this.className}`);
        javaFunctions.addImport(file, `${this.basePackage}.domain.entities.Json${this.className}SearchCriteria`);
        javaFunctions.addImport(file, `${this.basePackage}.persistence.criteria.${this.className}SearchCriteria`);
        javaFunctions.addImport(file, `${this.basePackage}.domain.entities.JsonSearchResult`);
        javaFunctions.addImport(file, `${this.basePackage}.core.service.${this.className}Service`);
        javaFunctions.addImport(file, `${this.basePackage}.api.convert.${this.className}Converter`);
        javaFunctions.addImport(file, `${this.basePackage}.api.convert.${this.className}SearchCriteriaConverter`);
        javaFunctions.addImport(file, `${this.basePackage}.api.convert.ConvertException`);
        javaFunctions.addImport(file, 'org.springframework.http.HttpStatus');
        javaFunctions.addImport(file, 'org.springframework.http.ResponseEntity');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertTrue');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }

    private addServiceMethodSearch(project: Project, basePath: string) {
        const rawJavaMethod = `
    public List<${this.className}> findBySearchCriteria(${this.className}SearchCriteria sc) {
        return ${this.className.toLowerCase()}Repository.findBySearchCriteria(sc);
    }`;

        const path = this.coreModule + basePath + "/core/service/" + this.className + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "findBySearchCriteria", rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".persistence.criteria." + this.className + "SearchCriteria");
    }

    private addServiceMethodCount(project: Project, basePath: string) {
        const rawJavaMethod = `  
    public int findNumberOf${this.className}(${this.className}SearchCriteria sc) {
        return ${this.className.toLowerCase()}Repository.findNumberOf${this.className}BySearchCriteria(sc);
    }
    `;

        const path = this.coreModule + basePath + "/core/service/" + this.className + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, `findNumberOf${this.className}`, rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
    }

    private addServiceMethodSearchUnitTest(project: Project) {

        const rawJavaMethod = ` 
 
    @Test
    public void testFindBySearchCriteria() {

        when(${this.className.toLowerCase()}Repository.findBySearchCriteria(${this.className.toLowerCase()}SearchCriteria)).thenReturn(Collections.singletonList(${this.className.toLowerCase()}));

        List<${this.className}> result${this.className}List = ${this.className.toLowerCase()}Service.findBySearchCriteria(${this.className.toLowerCase()}SearchCriteria);

        assertNotNull("No object returned!", result${this.className}List);
        assertEquals("Wrong number of objects returned!", 1, result${this.className}List.size());
        assertEquals("Wrong object returned!", ${this.className.toLowerCase()}, result${this.className}List.get(0));
    }`;

        const pathServiceUnitTest = this.coreModule + "/src/main/test/java/" + fileFunctions.toPath(this.basePackage) + "/core/service/" + this.className + "ServiceTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestService(project, pathServiceUnitTest, this.className, this.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.className + 'Repository');
        unitTestFunctions.addBeanParameter(file, `${this.className}SearchCriteria`);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${this.basePackage}.persistence.db.repo.${this.className}Repository`);
        javaFunctions.addImport(file, `${this.basePackage}.persistence.criteria.${this.className}SearchCriteria`);
        javaFunctions.addImport(file, 'java.util.Optional');
        javaFunctions.addImport(file, 'java.util.List');
        javaFunctions.addImport(file, 'java.util.Collections');

        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.junit.Assert.assertNotNull');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }

    private addConversionException(project: Project, basePath: string) {
        const path = this.apiModule + basePath + "/api/convert/ConvertException.java";
        const rawJavaContent = `package ${this.basePackage}.api.convert;

public class ConvertException extends RuntimeException {

    public ConvertException(String message) {
        super(message);
    }
}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addServiceMethodCountUnitTest(project: Project) {

        const rawJavaMethod = `
    
    @Test
    public void testFindNumberOf${this.className}() {

        when(${this.className.toLowerCase()}Repository.findNumberOf${this.className}BySearchCriteria(${this.className.toLowerCase()}SearchCriteria)).thenReturn(NUMBER_OF_${this.className.toUpperCase()}S);

        int resultNumber = ${this.className.toLowerCase()}Service.findNumberOf${this.className}(${this.className.toLowerCase()}SearchCriteria);

        assertEquals("Wrong number returned!", NUMBER_OF_${this.className.toUpperCase()}S, resultNumber);
    }`;

        const pathServiceUnitTest = this.coreModule + "/src/main/test/java/" + fileFunctions.toPath(this.basePackage) + "/core/service/" + this.className + "ServiceTest.java";
        if (!project.fileExists(pathServiceUnitTest)) {
            unitTestFunctions.basicUnitTestService(project, pathServiceUnitTest, this.className, this.basePackage);
        }

        const file: File = project.findFile(pathServiceUnitTest);
        const inputHook = '// @Input';
        file.replace(inputHook, inputHook + rawJavaMethod);

        unitTestFunctions.addMock(file, this.className + 'Repository');
        unitTestFunctions.addIntParameter(file, `NUMBER_OF_${this.className.toUpperCase()}S`);
        unitTestFunctions.addBeanParameter(file, `${this.className}SearchCriteria`);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, `${this.basePackage}.persistence.db.repo.${this.className}Repository`);
        javaFunctions.addImport(file, `${this.basePackage}.persistence.criteria.${this.className}SearchCriteria`);
        javaFunctions.addImport(file, 'java.util.Optional');

        javaFunctions.addImport(file, 'static org.junit.Assert.assertEquals');
        javaFunctions.addImport(file, 'static org.mockito.Mockito.when');
    }

    private addCustomRepository(project: Project, basePath: string) {
        const path = this.persistenceModule + basePath + "/persistence/db/repo/" + this.className + "RepositoryCustom.java";
        const rawJavaContent = `package ${this.basePackage}.persistence.db.repo;

import ${this.basePackage}.persistence.db.hibernate.bean.${this.className};
import ${this.basePackage}.persistence.criteria.${this.className}SearchCriteria;

import java.util.List;

public interface ${this.className}RepositoryCustom {

    int findNumberOf${this.className}BySearchCriteria(${this.className}SearchCriteria sc);

    List<${this.className}> findBySearchCriteria(${this.className}SearchCriteria sc);
}
`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addCustomRepositoryImplementation(project: Project, basePath: string) {
        const path = this.persistenceModule + basePath + "/persistence/db/repo/" + this.className + "RepositoryImpl.java";
        const rawJavaContent = `package ${this.basePackage}.persistence.db.repo;

import ${this.basePackage}.persistence.db.hibernate.bean.${this.className};
import ${this.basePackage}.persistence.criteria.${this.className}SearchCriteria;
import org.springframework.stereotype.Repository;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ${this.className}RepositoryImpl extends AbstractHibernateRepository<${this.className}> ` +
            `implements ${this.className}RepositoryCustom {

    private static final String ID_PROPERTY = "id";
    // @Property input

    @Override
    protected Class<${this.className}> getDomainClass() {
        return ${this.className}.class;
    }

    @Override
    public int findNumberOf${this.className}BySearchCriteria(${this.className}SearchCriteria sc) {
        CriteriaBuilder criteria = getDefaultCriteria();
        CriteriaQuery<Long> criteriaQuery = criteria.createQuery(Long.class);
        Root<${this.className}> root = criteriaQuery.from(getDomainClass());

        List<Predicate> predicates = createPredicates(sc, criteria, root);

        criteriaQuery.select(criteria.count(root)).distinct(true)
                .where(predicates.toArray(new Predicate[predicates.size()]));

        return getEntityManager()
                .createQuery(criteriaQuery)
                .getSingleResult()
                .intValue();
    }

    @Override
    public List<${this.className}> findBySearchCriteria(${this.className}SearchCriteria sc) {
        CriteriaBuilder criteria = getDefaultCriteria();
        CriteriaQuery<${this.className}> criteriaQuery = criteria.createQuery(getDomainClass());
        Root<${this.className}> root = criteriaQuery.from(getDomainClass());

        List<Predicate> predicates = createPredicates(sc, criteria, root);

        criteriaQuery.select(root).distinct(true)
                .where(predicates.toArray(new Predicate[predicates.size()]));

        return getEntityManager()
                .createQuery(criteriaQuery)
                .setFirstResult(sc.getStart())
                .setMaxResults(sc.getMaxResults())
                .getResultList();
    }

    private List<Predicate> createPredicates(${this.className}SearchCriteria sc, ` +
            `CriteriaBuilder criteria, Root<${this.className}> root) {

        List<Predicate> predicates = new ArrayList<>();

        sc.getId().ifPresent(id -> predicates.add(criteria.equal(root.get(ID_PROPERTY), id)));
        
        // @Predicate input

        return predicates;
    }
}
`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addTestConfigurationPersistenceModule(project: Project) {

        const propertiesPath = `${this.persistenceModule}/src/main/test/resources/application.yml`;
        const rawProperties = `spring.profiles.active: test
---
spring:
  profiles: test
  datasource:
    url: jdbc:h2:mem:testDB
    username: sa
    password: sa
    driver-class-name: org.h2.Driver
  liquibase:
    change-log: classpath:/db/liquibase/master-changelog.xml
`;
        if (!project.fileExists(propertiesPath)) {
            project.addFile(propertiesPath, rawProperties);
        }


        const configurationPath = `${this.persistenceModule}/src/main/test/java/${fileFunctions.toPath(this.basePackage)}/persistence/configuration/PersistenceTestConfiguration.java`;
        const rawConfiguration = `package ${this.basePackage}.persistence.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;

@Configuration
@PropertySource("classpath:application.yml")
@Import({ PersistenceConfiguration.class })
public class PersistenceTestConfiguration {

    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyPlaceholderConfigurer() {
        return new PropertySourcesPlaceholderConfigurer();
    }

}
`;
        if (!project.fileExists(configurationPath)) {
            project.addFile(configurationPath, rawConfiguration);
        }
    }

    private addCustomRepositoryImplementationUnitTest(project: Project) {

        const path = `${this.persistenceModule}/src/main/test/java/${fileFunctions.toPath(this.basePackage)}/persistence/db/repo/${this.className}RepositoryImplTest.java`;
        const rawJavaContent = `package ${this.basePackage}.persistence.db.repo;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import ${this.basePackage}.persistence.configuration.PersistenceTestConfiguration;
import ${this.basePackage}.persistence.criteria.${this.className}SearchCriteria;
import ${this.basePackage}.persistence.db.hibernate.bean.${this.className};
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;
import java.util.Optional;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@DataJpaTest
@ContextConfiguration(classes = { PersistenceTestConfiguration.class })
public class ${this.className}RepositoryImplTest {

    @Autowired
    private ${this.className}Repository ${this.className.toLowerCase()}Repository;

    // @InjectInput
    

    // @ParameterInput

    private ${this.className} ${this.className.toLowerCase()};
    private ${this.className} ${this.className.toLowerCase()}Diff;

    @Before
    public void setUp() {

        // @SubObjectCreationInput

        ${this.className.toLowerCase()} = ${this.className.toLowerCase()}Repository.save(${this.className}.builder()
                // @FieldInput
                .build());

        ${this.className.toLowerCase()}Diff = ${this.className.toLowerCase()}Repository.save(${this.className}.builder()
                // @FieldInput
                .build());

        // @ObjectCreationInput
    }

    @After
    public void tearDown() {

        // @TearDownInputTop
        ${this.className.toLowerCase()}Repository.deleteAll();
        // @TearDownInputBottom
    }

    @Test
    public void testFindNumberOf${this.className}BySearchCriteria_WithTooMuchProperties() {

        ${this.className}SearchCriteria searchCriteria = ${this.className}SearchCriteria.builder()
                .id(Optional.of(${this.className.toLowerCase()}Diff.getId()))
                // @CriteriaDiffInput
                .build();

        int result = ${this.className.toLowerCase()}Repository.findNumberOf${this.className}BySearchCriteria(searchCriteria);

        assertEquals("Wrong number of objects returned!", 0, result);
    }

    @Test
    public void testFindNumberOf${this.className}BySearchCriteria_WithPerfectProperties() {

        ${this.className}SearchCriteria searchCriteria = ${this.className}SearchCriteria.builder()
                .id(Optional.of(${this.className.toLowerCase()}.getId()))
                // @CriteriaInput
                .build();

        int result = ${this.className.toLowerCase()}Repository.findNumberOf${this.className}BySearchCriteria(searchCriteria);

        assertEquals("Wrong number of objects returned!", 1, result);
    }

    @Test
    public void testFindNumberOf${this.className}BySearchCriteria_WithIdProperty() {

        ${this.className}SearchCriteria searchCriteria = ${this.className}SearchCriteria.builder()
                .id(Optional.of(${this.className.toLowerCase()}Diff.getId()))
                .build();

        int result = ${this.className.toLowerCase()}Repository.findNumberOf${this.className}BySearchCriteria(searchCriteria);

        assertEquals("Wrong number of objects returned!", 1, result);
    }

    @Test
    public void testFindBySearchCriteria_WithTooMuchProperties() {

        ${this.className}SearchCriteria searchCriteria = ${this.className}SearchCriteria.builder()
                .id(Optional.of(${this.className.toLowerCase()}Diff.getId()))
                .build();

        List<${this.className}> result = ${this.className.toLowerCase()}Repository.findBySearchCriteria(searchCriteria);

        assertEquals("Wrong number of objects returned!", 0, result.size());
    }

    @Test
    public void testFindBySearchCriteria_WithPerfectProperties() {

        ${this.className}SearchCriteria searchCriteria = ${this.className}SearchCriteria.builder()
                .id(Optional.of(${this.className.toLowerCase()}.getId()))
                .build();

        List<${this.className}> result = ${this.className.toLowerCase()}Repository.findBySearchCriteria(searchCriteria);

        assertEquals("Wrong number of objects returned!", 1, result.size());
    }

    @Test
    public void testBySearchCriteria_WithIdProperty() {

        ${this.className}SearchCriteria searchCriteria = ${this.className}SearchCriteria.builder()
                .id(Optional.of(${this.className.toLowerCase()}Diff.getId()))
                .build();

        List<${this.className}> result = ${this.className.toLowerCase()}Repository.findBySearchCriteria(searchCriteria);

        assertEquals("Wrong number of objects returned!", 1, result.size());
    }

    // @Input
}
`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addAbstractRepository(project: Project, basePath: string) {
        const path = this.persistenceModule + basePath + "/persistence/db/repo/AbstractHibernateRepository.java";
        const rawJavaContent = `package ${this.basePackage}.persistence.db.repo;

import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;

/**
 * The base DAO for doing Hibernate actions.
 *
 * @param <T>
 *            The domain object that is managed by this DAO.
 */
@Repository
public abstract class AbstractHibernateRepository<T> {

    @PersistenceContext
    private EntityManager entityManager;

    /** The type of class the DAO is managing. */
    protected Class<T> domainClass = getDomainClass();

    /**
     * Method to return the class of the domain object.
     *
     * @return Returns a new domain object of the specified class type.
     */
    protected abstract Class<T> getDomainClass();

    protected CriteriaBuilder getDefaultCriteria() {
        return entityManager.getCriteriaBuilder();
    }

    protected EntityManager getEntityManager() {
        return entityManager;
    }
}
`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private extendRepository(project: Project, basePath: string) {
        const path = this.persistenceModule + basePath + "/persistence/db/repo/" + this.className + "Repository.java";
        const file: File = project.findFile(path);

        file.replace(">", `>, ${this.className}RepositoryCustom`)
    }

    private addIntegrationTests(project: Project) {
        const rawJavaMethod = `
    @Test
    public void testList_without${this.className}s() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.className.toLowerCase()}s"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong grand total returned.", response.getContentAsString().contains("\\"grandTotal\\":0"));
        assertTrue("Wrong number of results returned.", response.getContentAsString().contains("\\"numberOfResults\\":0"));
        assertTrue("Wrong entities returned.", response.getContentAsString().contains("\\"results\\":[]"));
    }

    @Test
    public void testList_with${this.className}s() throws Exception {
    
        ${this.className} saved${this.className} = IntegrationTestFactory.givenA${this.className}(${this.className.toLowerCase()}Repository);
        IntegrationTestFactory.givenA${this.className}(${this.className.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.className.toLowerCase()}s"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong grand total returned.", response.getContentAsString().contains("\\"grandTotal\\":2"));
        assertTrue("Wrong number of results returned.", response.getContentAsString().contains("\\"numberOfResults\\":2"));
        assertTrue("Wrong entity link returned.", response.getContentAsString().contains("${this.className.toLowerCase()}s/" + saved${this.className}.getId()));
    }`;

        const path = this.apiModule + "/src/main/test/java/integration/" + this.className + "ResourceIT.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "testList_without" + this.className + "s", rawJavaMethod);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, "org.springframework.http.HttpStatus");
        javaFunctions.addImport(file, "org.springframework.mock.web.MockHttpServletResponse");
        javaFunctions.addImport(file, "static org.junit.Assert.assertEquals");
        javaFunctions.addImport(file, "static org.junit.Assert.assertTrue");
        javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
    }
}

export const addSearchCriteria = new AddSearchCriteria();
