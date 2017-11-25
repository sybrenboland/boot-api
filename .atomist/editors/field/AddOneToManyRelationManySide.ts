import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../functions/JavaClassFunctions";

export class AddOneToManyRelationManySide {

    private classNameOne: string;
    private classNameMany: string;
    private basePackage: string;
    private apiModule: string;

    public edit(project: Project, basePath: string, classNameOneInput: string, classNameManyInput: string,
                basePackageInput: string, apiModuleInput: string) {
        this.classNameOne = classNameOneInput;
        this.classNameMany = classNameManyInput;
        this.basePackage = basePackageInput;
        this.apiModule = apiModuleInput;

        this.addLinkToConverter(project, basePath);
        this.addMehtodResourceInterfaceManySide(project, basePath);
        this.addMethodResourceClassManySide(project, basePath);
        this.addMethodServiceOneSide(project, basePath);
    }

    private addLinkToConverter(project: Project, basePath: string) {
        const inputHook = "// @InputJsonField";
        const rawJavaCode = inputHook + `
        
        json${this.classNameMany}.add(linkTo(${this.classNameMany}Controller.class).` +
            `slash(${this.classNameMany.toLowerCase()}.getId()).slash("/${this.classNameOne.toLowerCase()}s")` +
            `.withRel("${this.classNameOne.toLowerCase()}"));`;

        const path = this.apiModule + basePath + "/convert/" + this.classNameMany + "Converter.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawJavaCode);

            javaFunctions.addImport(file, this.basePackage + ".resource." + this.classNameMany + "Controller");
            javaFunctions.addImport(file, "static org.springframework.hateoas.mvc.ControllerLinkBuilder.linkTo");
        } else {
            console.error("Converter not added yet!");
        }
    }

    private addMehtodResourceInterfaceManySide(project: Project, basePath: string) {
        const rawJavaMethod = `
    @RequestMapping(path = "/{${this.classNameMany.toLowerCase()}Id}/${this.classNameOne.toLowerCase()}s", ` +
            `method = RequestMethod.GET)
    ResponseEntity get${this.classNameOne}(@PathVariable long ${this.classNameMany.toLowerCase()}Id);`;

        const path = this.apiModule + basePath + "/resource/I" + this.classNameMany + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.classNameOne, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }

    private addMethodResourceClassManySide(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    public ResponseEntity get${this.classNameOne}(@PathVariable long ${this.classNameMany.toLowerCase()}Id) {
        Json${this.classNameOne} json${this.classNameOne} = ${this.classNameOne.toLowerCase()}Service` +
            `.fetch${this.classNameOne}For${this.classNameMany}(${this.classNameMany.toLowerCase()}Id);

        return json${this.classNameOne} != null ? ResponseEntity.ok(json${this.classNameOne}) : ` +
            `ResponseEntity.notFound().build();
    }`;

        const path = this.apiModule + basePath + "/resource/" + this.classNameMany + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "get" + this.classNameOne + "s", rawJavaMethod);

        javaFunctions.addImport(file, "java.util.List");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.classNameOne);

        javaFunctions.addToConstructor(file, this.classNameMany + "Controller",
           this.classNameOne.toLowerCase() + "Service");
        javaFunctions.addImport(file, this.basePackage + ".service." + this.classNameOne + "Service");
    }

    public addMethodServiceOneSide(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public Json${this.classNameOne} fetch${this.classNameOne}For${this.classNameMany}` +
            `(long ${this.classNameMany.toLowerCase()}Id) {
        ${this.classNameMany} ${this.classNameMany.toLowerCase()} = ${this.classNameMany.toLowerCase()}Repository.findOne` +
            `(${this.classNameMany.toLowerCase()}Id);
        return ${this.classNameMany.toLowerCase()} != null && ${this.classNameMany.toLowerCase()}.` +
            `get${this.classNameOne}() != null ? ${this.classNameOne.toLowerCase()}Converter.` +
            `toJson(${this.classNameMany.toLowerCase()}.get${this.classNameOne}()) : null;
    }`;

        const path = this.apiModule + basePath + "/service/" + this.classNameOne + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "fetch" + this.classNameOne + "sFor" + this.classNameMany, rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.classNameOne);
        javaFunctions.addImport(file, this.basePackage + ".db.hibernate.bean." + this.classNameMany);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");

        javaFunctions.addToConstructor(file, this.classNameOne + "Service",
            this.classNameMany.toLowerCase() + "Repository");
        javaFunctions.addImport(file, this.basePackage + ".db.repo." + this.classNameMany + "Repository");
    }
}

export const addOneToManyRelationManySide = new AddOneToManyRelationManySide();
