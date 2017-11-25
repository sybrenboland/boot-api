import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../functions/JavaClassFunctions";

export class AddOneToManyDelete {
    private mainClassName: string;
    private otherClassName: string;
    private basePackage: string;
    private apiModule: string;

    public addDelete(project: Project, basePath: string, mainClassName: string, otherClassName: string, basePackage: string, apiModule: string) {
        this.mainClassName = mainClassName;
        this.otherClassName = otherClassName;
        this.basePackage = basePackage;
        this.apiModule = apiModule;

        this.addMethodResourceInterface(project, basePath);
        this.addMethodResourceClass(project, basePath);
    }

    public addMethodServiceOneSide(project: Project, basePath: string, classNameOne: string, classNameMany: string, basePackage: string, apiModule: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean remove${classNameMany}(long ${classNameOne.toLowerCase()}Id, ` +
            `long ${classNameMany.toLowerCase()}Id) {
        ${classNameOne} ${classNameOne.toLowerCase()} = ${classNameOne.toLowerCase()}Repository.` +
            `findOne(${classNameOne.toLowerCase()}Id);
        if (${classNameOne.toLowerCase()} != null) {

            ${classNameMany} ${classNameMany.toLowerCase()} = ` +
            `${classNameMany.toLowerCase()}Repository.findOne(${classNameMany.toLowerCase()}Id);
            if (${classNameMany.toLowerCase()} != null && ${classNameMany.toLowerCase()}.get${classNameOne}() != null && ` +
            `${classNameOne.toLowerCase()}.getId().equals(${classNameMany.toLowerCase()}.get${classNameOne}().getId())) {

                ${classNameOne.toLowerCase()}.remove${classNameMany}(${classNameMany.toLowerCase()});
                ${classNameOne.toLowerCase()}Repository.save(${classNameOne.toLowerCase()});
                return true;
            }
        }

        return false;
    }`;

        const path = apiModule + basePath + "/service/" + classNameOne + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "remove" + classNameMany, rawJavaMethod);

        javaFunctions.addImport(file, basePackage + ".db.hibernate.bean." + classNameMany);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");

        javaFunctions.addToConstructor(file, classNameOne + "Service", classNameMany.toLowerCase() + "Repository");
        javaFunctions.addImport(file, this.basePackage + ".db.repo." + classNameMany + "Repository");
    }

    public addMethodServiceManySide(project: Project, basePath: string, classNameOne: string, classNameMany: string,
                                    basePackage: string, apiModule: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean remove${classNameOne}(long ${classNameMany.toLowerCase()}Id, ` +
            `long ${classNameOne.toLowerCase()}Id) {
        ${classNameMany} ${classNameMany.toLowerCase()} = ${classNameMany.toLowerCase()}Repository.` +
            `findOne(${classNameMany.toLowerCase()}Id);
        if (${classNameMany.toLowerCase()} != null && ${classNameMany.toLowerCase()}.get${classNameOne}() != null) {

            ${classNameOne} ${classNameOne.toLowerCase()} = ` +
            `${classNameOne.toLowerCase()}Repository.findOne(${classNameOne.toLowerCase()}Id);
            if (${classNameOne.toLowerCase()} != null && ${classNameOne.toLowerCase()}.getId().` +
            `equals(${classNameMany.toLowerCase()}.get${classNameOne}().getId())) {

                ${classNameMany.toLowerCase()}.set${classNameOne}(null);
                ${classNameMany.toLowerCase()}Repository.save(${classNameMany.toLowerCase()});
                return true;
            }
        }

        return false;
    }`;

        const path = apiModule + basePath + "/service/" + classNameMany + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "remove" + classNameOne, rawJavaMethod);

        javaFunctions.addImport(file, basePackage + ".db.hibernate.bean." + classNameOne);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
    }

    private addMethodResourceInterface(project: Project, basePath: string) {
        const rawJavaMethod = `
    @RequestMapping(value = "/{${this.mainClassName.toLowerCase()}Id}/${this.otherClassName.toLowerCase()}s/` +
            `{${this.otherClassName.toLowerCase()}Id}", method = RequestMethod.DELETE)
    ResponseEntity delete${this.otherClassName}With${this.mainClassName}(` +
            `@PathVariable("${this.mainClassName.toLowerCase()}Id") long ${this.mainClassName.toLowerCase()}Id, ` +
            `@PathVariable("${this.otherClassName.toLowerCase()}Id") long ${this.otherClassName.toLowerCase()}Id);`;

        const path = this.apiModule + basePath + "/resource/I" + this.mainClassName + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.otherClassName + "With" + this.mainClassName, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }

    private addMethodResourceClass(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    public ResponseEntity delete${this.otherClassName}With${this.mainClassName}(@PathVariable long ` +
            `${this.mainClassName.toLowerCase()}Id, @PathVariable long ${this.otherClassName.toLowerCase()}Id) {

        return ${this.mainClassName.toLowerCase()}Service.remove${this.otherClassName}` +
            `(${this.mainClassName.toLowerCase()}Id, ${this.otherClassName.toLowerCase()}Id) ?
                ResponseEntity.ok().build() :
                ResponseEntity.notFound().build();
    }`;

        const path = this.apiModule + basePath + "/resource/" + this.mainClassName + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.otherClassName + "With" + this.mainClassName, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }
}


export const addOneToManyDelete = new AddOneToManyDelete();
