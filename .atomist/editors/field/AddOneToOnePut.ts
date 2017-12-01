import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../functions/JavaClassFunctions";

export class AddOneToOnePut {
    private mainClassName: string;
    private otherClassName: string;
    private basePackage: string;
    private apiModule: string;

    public addPutBiDirectional(project: Project, basePath: string, mainClassName: string, otherClassName: string, basePackage: string, apiModule: string) {
        this.mainClassName = mainClassName;
        this.otherClassName = otherClassName;
        this.basePackage = basePackage;
        this.apiModule = apiModule;

        this.addMethodResourceInterface(project, basePath);
        this.addMethodResourceClass(project, basePath);
        this.addMethodServiceBiDirectional(project, basePath);
    }

    public addPutUniDirectional(project: Project, basePath: string, mainClassName: string, otherClassName: string, basePackage: string, apiModule: string) {
        this.mainClassName = mainClassName;
        this.otherClassName = otherClassName;
        this.basePackage = basePackage;
        this.apiModule = apiModule;

        this.addMethodResourceInterface(project, basePath);
        this.addMethodResourceClass(project, basePath);
        this.addMethodServiceUniDirectional(project, basePath);
    }

    public addMethodServiceBiDirectional(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public Json${this.otherClassName} update${this.mainClassName}With${this.otherClassName}` +
            `(long ${this.mainClassName.toLowerCase()}Id, Json${this.otherClassName} json${this.otherClassName}) {
        ${this.mainClassName} ${this.mainClassName.toLowerCase()} = ` +
            `${this.mainClassName.toLowerCase()}Repository.findOne(${this.mainClassName.toLowerCase()}Id);
        if (${this.mainClassName.toLowerCase()} != null) {

            ${this.otherClassName} ${this.otherClassName.toLowerCase()} = ` +
            `${this.otherClassName.toLowerCase()}Converter.copyFields(json${this.otherClassName}, new ${this.otherClassName}());
            ${this.otherClassName.toLowerCase()}.set${this.mainClassName}(${this.mainClassName.toLowerCase()});
            ${this.otherClassName.toLowerCase()}Repository.save(${this.otherClassName.toLowerCase()});

            return ${this.otherClassName.toLowerCase()}Converter.toJson(${this.otherClassName.toLowerCase()});
        }

        return null;
    }`;

        const path = this.apiModule + basePath + "/service/" + this.mainClassName + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + this.mainClassName + "With" + this.otherClassName,
            rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".db.hibernate.bean." + this.otherClassName);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.otherClassName);

        javaFunctions.addToConstructor(file, this.mainClassName + "Service",
            this.otherClassName.toLowerCase() + "Repository");
        javaFunctions.addImport(file, this.basePackage + ".db.repo." + this.otherClassName + "Repository");

        javaFunctions.addToConstructor(file, this.mainClassName + "Service",
            this.otherClassName.toLowerCase() + "Converter");
        javaFunctions.addImport(file, this.basePackage + ".convert." + this.otherClassName + "Converter");
    }

    public addMethodServiceUniDirectional(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public Json${this.otherClassName} update${this.mainClassName}With${this.otherClassName}` +
            `(long ${this.mainClassName.toLowerCase()}Id, Json${this.otherClassName} json${this.otherClassName}) {
        ${this.mainClassName} ${this.mainClassName.toLowerCase()} = ` +
            `${this.mainClassName.toLowerCase()}Repository.findOne(${this.mainClassName.toLowerCase()}Id);
        if (${this.mainClassName.toLowerCase()} != null) {

            ${this.otherClassName} ${this.otherClassName.toLowerCase()} = ` +
            `${this.otherClassName.toLowerCase()}Converter.copyFields(json${this.otherClassName}, new ${this.otherClassName}());
            ${this.mainClassName.toLowerCase()}.set${this.otherClassName}(${this.otherClassName.toLowerCase()});
            ${this.mainClassName.toLowerCase()}Repository.save(${this.mainClassName.toLowerCase()});

            return ${this.otherClassName.toLowerCase()}Converter.toJson(${this.otherClassName.toLowerCase()});
        }

        return null;
    }`;

        const path = this.apiModule + basePath + "/service/" + this.mainClassName + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + this.mainClassName + "With" + this.otherClassName,
            rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".db.hibernate.bean." + this.otherClassName);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.otherClassName);

        javaFunctions.addToConstructor(file, this.mainClassName + "Service",
            this.otherClassName.toLowerCase() + "Converter");
        javaFunctions.addImport(file, this.basePackage + ".convert." + this.otherClassName + "Converter");
    }

    private addMethodResourceInterface(project: Project, basePath: string) {
        const rawJavaMethod = `
    @RequestMapping(value = "/{${this.mainClassName.toLowerCase()}Id}/${this.otherClassName.toLowerCase()}", ` +
            `method = RequestMethod.PUT)
    ResponseEntity put${this.otherClassName}With${this.mainClassName}` +
            `(@PathVariable("${this.mainClassName.toLowerCase()}Id") long ${this.mainClassName.toLowerCase()}Id, ` +
            `@RequestBody Json${this.otherClassName} ${this.otherClassName.toLowerCase()});`;

        const path = this.apiModule + basePath + "/resource/I" + this.mainClassName + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.otherClassName + "With" + this.mainClassName, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.otherClassName);
    }

    private addMethodResourceClass(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    public ResponseEntity put${this.otherClassName}With${this.mainClassName}` +
            `(@PathVariable long ${this.mainClassName.toLowerCase()}Id, ` +
            `@RequestBody Json${this.otherClassName} json${this.otherClassName}) {

        Json${this.otherClassName} newJson${this.otherClassName} = ${this.mainClassName.toLowerCase()}Service.` +
            `update${this.mainClassName}With${this.otherClassName}(${this.mainClassName.toLowerCase()}Id, ` +
            `json${this.otherClassName});

        return  newJson${this.otherClassName} != null ?
                ResponseEntity.ok(newJson${this.otherClassName}) :
                ResponseEntity.notFound().build();
    }`;

        const path = this.apiModule + basePath + "/resource/" + this.mainClassName + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "put" + this.otherClassName + "With" + this.mainClassName, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
        javaFunctions.addImport(file, this.basePackage + ".domain.Json" + this.otherClassName);
    }

    public overrideSetter(project: Project, basePath: string, classNameMappedBy: string, classNameOther: string,
                  persistenceModule: string) {
        const rawJavaMethod = `
    public void set${classNameOther}(${classNameOther} ${classNameOther.toLowerCase()}) {
        if(${classNameOther.toLowerCase()} != null) {
            ${classNameOther.toLowerCase()}.set${classNameMappedBy}(this);
        }
        this.${classNameOther.toLowerCase()} = ${classNameOther.toLowerCase()};
    }`;

        const path = persistenceModule + basePath + "/db/hibernate/bean/" + classNameMappedBy + ".java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "set" + classNameOther, rawJavaMethod);
    }
}

export const addOneToOnePut = new AddOneToOnePut();
