import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../functions/JavaClassFunctions";

export class AddOneToManyRelationOneSide {

    private classNameOne: string;
    private classNameMany: string;
    private basePackage: string;
    private persistenceModule: string;
    private apiModule: string;

    public edit(project: Project, basePath: string, classNameOneInput: string, classNameManyInput: string,
                basePackageInput: string, persistenceModuleInput: string, apiModuleInput: string) {
        this.classNameOne = classNameOneInput;
        this.classNameMany = classNameManyInput;
        this.basePackage = basePackageInput;
        this.persistenceModule = persistenceModuleInput;
        this.apiModule = apiModuleInput;

        this.addLinkToConverter(project, basePath);
        this.addMehtodResourceInterfaceOneSide(project, basePath);
        this.addMethodResourceClassOneSide(project, basePath);
        this.addMethodServiceManySide(project, basePath);
        this.addFieldSearchCriteria(project, basePath);
        this.addFieldToPredicates(project, basePath);
    }

    private addLinkToConverter(project: Project, basePath: string) {
        const inputHook = "// @InputJsonField";
        const rawJavaCode = inputHook + `
        
        json${this.classNameOne}.add(linkTo(${this.classNameOne}Controller.class).` +
            `slash(${this.classNameOne.toLowerCase()}.getId()).slash("/${this.classNameMany.toLowerCase()}s")` +
            `.withRel("${this.classNameMany.toLowerCase()}s"));`;

        const path = this.apiModule + basePath + "/convert/" + this.classNameOne + "Converter.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawJavaCode);

            javaFunctions.addImport(file, this.basePackage + ".resource." + this.classNameOne + "Controller");
            javaFunctions.addImport(file, "static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo");
        } else {
            console.error("Converter not added yet!");
        }
    }

    private addMehtodResourceInterfaceOneSide(project: Project, basePath: string) {
        const rawJavaMethod = `
    @RequestMapping(path = "/{${this.classNameOne.toLowerCase()}Id}/${this.classNameMany.toLowerCase()}s", ` +
            `method = RequestMethod.GET)
    ResponseEntity get${this.classNameMany}s(@PathVariable long ${this.classNameOne.toLowerCase()}Id);`;

        const path = this.apiModule + basePath + "/resource/I" + this.classNameOne + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.classNameMany + "s", rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }

    private addMethodResourceClassOneSide(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    public ResponseEntity get${this.classNameMany}s(@PathVariable long ${this.classNameOne.toLowerCase()}Id) {
        List<Json${this.classNameMany}> json${this.classNameMany}List = ` +
            `${this.classNameMany.toLowerCase()}Service.fetch${this.classNameMany}sFor${this.classNameOne}` +
            `(${this.classNameOne.toLowerCase()}Id);

        if (json${this.classNameMany}List.isEmpty()) {
            return ResponseEntity.notFound().build();
        } else {
            return ResponseEntity.ok(json${this.classNameMany}List);
        }
    }`;

        const path = this.apiModule + basePath + "/resource/" + this.classNameOne + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.classNameMany + "s", rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.classNameMany);

        javaFunctions.addToConstructor(file, this.classNameOne + "Controller",
            this.classNameMany.toLowerCase() + "Service");
        javaFunctions.addImport(file, this.basePackage + ".service." + this.classNameMany + "Service");
    }

    private addFieldSearchCriteria(project: Project, basePath: string) {
        const inputHook = "// @Input";
        const rawJavaCode = `private Optional<Long> ${this.classNameOne}Id = Optional.empty();
    
    ` + inputHook;

        const path = this.persistenceModule + basePath + "/domain/" + this.classNameMany + "SearchCriteria.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("SearchCriteria class not added yet!");
        }
    }

    private addFieldToPredicates(project: Project, basePath: string) {
        const propertyInputHook = "// @Property input";
        const rawJavaPropertyCode = `private static final String ` +
            `${this.classNameOne.toUpperCase()}_PROPERTY = "${this.classNameOne.toLowerCase()}";
    ` + propertyInputHook;

        const predicateInputHook = "// @Predicate input";
        const rawPredicateJavaCode = `sc.get${this.classNameOne}Id().ifPresent(${this.classNameOne.toLowerCase()}Id ` +
            `-> predicates.add(criteria.equal(root.get(${this.classNameOne.toUpperCase()}_PROPERTY).get(ID_PROPERTY), ` +
            `${this.classNameOne.toLowerCase()}Id)));
    
        ` + predicateInputHook;

        const path = this.persistenceModule + basePath + "/db/repo/" + this.classNameMany + "RepositoryImpl.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(predicateInputHook, rawPredicateJavaCode);
            file.replace(propertyInputHook, rawJavaPropertyCode);
        } else {
            console.error("Custom repository implementation class not added yet!");
        }
    }

    public addMethodServiceManySide(project: Project, basePath: string)
    {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public List<Json${this.classNameMany}> fetch${this.classNameMany}sFor${this.classNameOne}` +
            `(long ${this.classNameOne.toLowerCase()}Id) {
        ${this.classNameMany}SearchCriteria ${this.classNameMany.toLowerCase()}SearchCriteria = ` +
            `new ${this.classNameMany}SearchCriteria();
        ${this.classNameMany.toLowerCase()}SearchCriteria.set${this.classNameOne}Id` +
            `(Optional.of(${this.classNameOne.toLowerCase()}Id));
        List<${this.classNameMany}> ${this.classNameMany.toLowerCase()}List = ` +
            `${this.classNameMany.toLowerCase()}Repository.` +
            `findBySearchCriteria(${this.classNameMany.toLowerCase()}SearchCriteria);

        return ${this.classNameMany.toLowerCase()}List.stream().` +
            `map(${this.classNameMany.toLowerCase()}Converter::toJson).collect(Collectors.toList());
    }`;

        const path = this.apiModule + basePath + "/service/" + this.classNameMany + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "fetch" + this.classNameMany + "sFor" + this.classNameOne, rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.classNameMany);
        javaFunctions.addImport(file, this.basePackage + ".db.hibernate.bean." + this.classNameMany);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
    }
}


export const addOneToManyRelationOneSide = new AddOneToManyRelationOneSide();
