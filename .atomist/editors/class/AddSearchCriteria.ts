import {File} from "@atomist/rug/model/File";
import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";
import {javaFunctions} from "../functions/JavaClassFunctions";
import {fileFunctions} from "../functions/FileFunctions";

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

        const basePath = "/src/main/java/" + this.basePackage.replace(/\./gi, "/");

        this.addDependencies(project);

        this.addJsonSearchResult(project, basePath);
        this.addJsonSearchCriteria(project, basePath);
        this.addSearchCriteria(project, basePath);
        this.addSearchCriteriaConverter(project, basePath);

        this.addResourceInterfaceMethod(project, basePath);
        this.addResourceMethod(project, basePath);
        this.addServiceMethodSearch(project, basePath);
        this.addServiceMethodCount(project, basePath);

        this.addCustomRepository(project, basePath);
        this.addCustomRepositoryImplementation(project, basePath);
        this.addAbstractRepository(project, basePath);
        this.extendRepository(project, basePath);
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
        const path = this.domainModule + basePath + "/domain/JsonSearchResult.java";
        const rawJavaContent = `package ${this.basePackage}.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
        const path = this.domainModule + basePath + "/domain/Json" + this.className + "SearchCriteria.java";
        const rawJavaContent = `package ${this.basePackage}.domain;

import javax.ws.rs.QueryParam;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class Json${this.className}SearchCriteria {

    private static final int DEFAULT_MAX_RESULTS = 10;

    @QueryParam("maxResults")
    private int maxResults = DEFAULT_MAX_RESULTS;

    @QueryParam("start")
    private int start;

    @QueryParam("id")
    private long id;
    
    // @Input

}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addSearchCriteria(project: Project, basePath: string) {
        const path = this.persistenceModule + basePath + "/domain/" + this.className + "SearchCriteria.java";
        const rawJavaContent = `package ${this.basePackage}.domain;

import java.util.Optional;

import lombok.Data;

@Data
public class ${this.className}SearchCriteria {

    private int maxResults = 10;

    private int start = 0;

    private Optional<Long> id = Optional.empty();
    
    // @Input
}
`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addSearchCriteriaConverter(project: Project, basePath: string) {
        const path = this.apiModule + basePath + "/convert/SearchCriteriaConverter.java";
        const rawJavaContent = `package ${this.basePackage}.convert;

import ${this.basePackage}.domain.Json${this.className}SearchCriteria;
import ${this.basePackage}.domain.${this.className}SearchCriteria;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service("searchCriteriaConverter")
public class SearchCriteriaConverter {

    public ${this.className}SearchCriteria createSearchCriteria` +
            `(Json${this.className}SearchCriteria json${this.className}SearchCriteria) {
        ${this.className}SearchCriteria sc = new ${this.className}SearchCriteria();

        sc.setStart(json${this.className}SearchCriteria.getStart());
        if (json${this.className}SearchCriteria.getMaxResults() > 0) {
            sc.setMaxResults(json${this.className}SearchCriteria.getMaxResults());
        } else {
            throw new ConvertException("Maximum number of results should be a positive number.");
        }

        long id = json${this.className}SearchCriteria.getId();
        sc.setId(id == 0 ? Optional.empty() : Optional.of(id));
        
        // @Input

        return sc;
    }
}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }

        this.addConversionException(project, basePath);
    }

    private addResourceInterfaceMethod(project: Project, basePath: string) {
        const rawJavaMethod = `    
    @RequestMapping(path = "", method = RequestMethod.GET)
    ResponseEntity<JsonSearchResult> list(@BeanParam Json${this.className}SearchCriteria searchCriteria);`;

        const path = this.apiModule + basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "list", rawJavaMethod);

        javaFunctions.addImport(file, "org.shboland.domain.Json" + this.className + "SearchCriteria");
        javaFunctions.addImport(file, "org.shboland.domain.JsonSearchResult");
        javaFunctions.addImport(file, "javax.ws.rs.BeanParam");
    }

    private addResourceMethod(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    public ResponseEntity<JsonSearchResult> list(@BeanParam Json${this.className}SearchCriteria searchCriteria) {

        ${this.className}SearchCriteria sc;
        try {
            sc = searchCriteriaConverter.createSearchCriteria(searchCriteria);
        } catch (ConvertException e) {
            log.warn("Conversion failed!", e);
            return ResponseEntity.badRequest().build();
        }

        List<Json${this.className}> json${this.className}List = new ArrayList<>();
        int numberOf${this.className} = ${this.className.toLowerCase()}Service.findNumberOf${this.className}(sc);
        if (numberOf${this.className} > 0) {
            ${this.className.toLowerCase()}Service.findBySearchCriteria(sc).stream()` +
            `.forEach(${this.className.toLowerCase()} -> json${this.className}List.add` +
            `(${this.className.toLowerCase()}Converter.toJson(${this.className.toLowerCase()})));
        }

        JsonSearchResult<Json${this.className}> result = JsonSearchResult.<Json${this.className}>builder()
                .results(json${this.className}List)
                .numberOfResults(json${this.className}List.size())
                .grandTotalNumberOfResults(numberOf${this.className})
                .build();

        return ResponseEntity.ok(result);
    }`;

        const path = this.apiModule + basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "list", rawJavaMethod);

        javaFunctions.addMemberToClass(file, "private final SearchCriteriaConverter searchCriteriaConverter");
        javaFunctions.addConstructorArgument(file, this.className + "Controller", "SearchCriteriaConverter searchCriteriaConverter");
        javaFunctions.addConstructorAssignment(file, "searchCriteriaConverter");
        javaFunctions.addImport(file, this.basePackage + ".convert.SearchCriteriaConverter");

        javaFunctions.addMemberToClass(file, "private final PersonConverter personConverter");
        javaFunctions.addConstructorArgument(file, this.className + "Controller", "PersonConverter personConverter");
        javaFunctions.addConstructorAssignment(file, "personConverter");
        javaFunctions.addImport(file, this.basePackage + ".convert." + this.className + "Converter");

        javaFunctions.addAnnotationToClass(file, "@Slf4j");
        javaFunctions.addImport(file, "lombok.extern.slf4j.Slf4j");
        javaFunctions.addImport(file, "org.shboland.domain.Json" + this.className + "SearchCriteria");
        javaFunctions.addImport(file, "org.shboland.domain.JsonSearchResult");
        javaFunctions.addImport(file, "org.shboland.convert.ConvertException");
        javaFunctions.addImport(file, "org.shboland.domain." + this.className + "SearchCriteria");
        javaFunctions.addImport(file, "java.util.ArrayList");
        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, "javax.ws.rs.BeanParam");
    }

    private addServiceMethodSearch(project: Project, basePath: string) {
        const rawJavaMethod = `    
    @Transactional(propagation = Propagation.REQUIRED)
    public List<${this.className}> findBySearchCriteria(${this.className}SearchCriteria sc) {

        List<${this.className}> ${this.className.toLowerCase()}List = ` +
            `${this.className.toLowerCase()}Repository.findBySearchCriteria(sc);
        ${this.className.toLowerCase()}List.forEach(${this.className}Service::initialize${this.className});

        return ${this.className.toLowerCase()}List;
    }

    private static void initialize${this.className}(${this.className} ${this.className.toLowerCase()}) {
        if (${this.className.toLowerCase()} != null) {
           // @Initialise
        }
    }`;

        const path = this.apiModule + basePath + "/service/" + this.className + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "findBySearchCriteria", rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".domain." + this.className + "SearchCriteria");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
    }

    private addServiceMethodCount(project: Project, basePath: string) {
        const rawJavaMethod = `    
    @Transactional(propagation = Propagation.REQUIRED)
    public int findNumberOf${this.className}(${this.className}SearchCriteria sc) {
        return ${this.className.toLowerCase()}Repository.findNumberOf${this.className}BySearchCriteria(sc);
    }
    `;

        const path = this.apiModule + basePath + "/service/" + this.className + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, `findNumberOf${this.className}`, rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
    }

    private addConversionException(project: Project, basePath: string) {
        const path = this.apiModule + basePath + "/convert/ConvertException.java";
        const rawJavaContent = `package ${this.basePackage}.convert;

public class ConvertException extends RuntimeException {

    public ConvertException(String message) {
        super(message);
    }

    public ConvertException(String message, Throwable cause) {
        super(message, cause);
    }
}`;

        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaContent);
        }
    }

    private addCustomRepository(project: Project, basePath: string) {
        const path = this.persistenceModule + basePath + "/db/repo/" + this.className + "RepositoryCustom.java";
        const rawJavaContent = `package ${this.basePackage}.db.repo;

import ${this.basePackage}.db.hibernate.bean.${this.className};
import ${this.basePackage}.domain.${this.className}SearchCriteria;

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
        const path = this.persistenceModule + basePath + "/db/repo/" + this.className + "RepositoryImpl.java";
        const rawJavaContent = `package ${this.basePackage}.db.repo;

import ${this.basePackage}.db.hibernate.bean.${this.className};
import ${this.basePackage}.domain.${this.className}SearchCriteria;
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

        criteriaQuery
                .select(criteria.count(root))
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

        criteriaQuery.select(root).where(predicates.toArray(new Predicate[predicates.size()]));

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

    private addAbstractRepository(project: Project, basePath: string) {
        const path = this.persistenceModule + basePath + "/db/repo/AbstractHibernateRepository.java";
        const rawJavaContent = `package ${this.basePackage}.db.repo;

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
        const path = this.persistenceModule + basePath + "/db/repo/" + this.className + "Repository.java";
        const file: File = project.findFile(path);

        file.replace(">", `>, ${this.className}RepositoryCustom`)
    }
}

export const addSearchCriteria = new AddSearchCriteria();
