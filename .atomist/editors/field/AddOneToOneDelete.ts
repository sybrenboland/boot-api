import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../functions/JavaClassFunctions";

export class AddOneToOneDelete {
    private mainClassName: string;
    private otherClassName: string;
    private basePackage: string;
    private apiModule: string;

    public addDeleteBiDirectional(project: Project, basePath: string, mainClassName: string, otherClassName: string, basePackage: string, apiModule: string) {
        this.mainClassName = mainClassName;
        this.otherClassName = otherClassName;
        this.basePackage = basePackage;
        this.apiModule = apiModule;

        this.addMethodResourceInterface(project, basePath);
        this.addMethodResourceClassBiDirectional(project, basePath);
        this.addMethodService(project, basePath);
    }

    public addDeleteUniDirectional(project: Project, basePath: string, mainClassName: string, otherClassName: string, basePackage: string, apiModule: string) {
        this.mainClassName = mainClassName;
        this.otherClassName = otherClassName;
        this.basePackage = basePackage;
        this.apiModule = apiModule;

        this.addMethodResourceInterface(project, basePath);
        this.addMethodResourceClassUniDirectional(project, basePath);
    }

    private addMethodService(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean remove${this.otherClassName}(long ${this.mainClassName.toLowerCase()}Id) {
        ${this.mainClassName} ${this.mainClassName.toLowerCase()} = ${this.mainClassName.toLowerCase()}Repository.` +
            `findOne(${this.mainClassName.toLowerCase()}Id);
        if (${this.mainClassName.toLowerCase()} != null && ${this.mainClassName.toLowerCase()}.get${this.otherClassName}() != null) {

            ${this.mainClassName.toLowerCase()}.set${this.otherClassName}(null);
            ${this.mainClassName.toLowerCase()}Repository.save(${this.mainClassName.toLowerCase()});
            return true;
        }

        return false;
    }`;

        const path = this.apiModule + basePath + "/service/" + this.mainClassName + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "remove" + this.otherClassName, rawJavaMethod);

        javaFunctions.addImport(file, this.basePackage + ".db.hibernate.bean." + this.otherClassName);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
    }

    private addMethodResourceInterface(project: Project, basePath: string) {
        const rawJavaMethod = `
    @RequestMapping(value = "/{${this.mainClassName.toLowerCase()}Id}/${this.otherClassName.toLowerCase()}", ` +
            `method = RequestMethod.DELETE)
    ResponseEntity delete${this.otherClassName}With${this.mainClassName}` +
            `(@PathVariable("${this.mainClassName.toLowerCase()}Id") long ${this.mainClassName.toLowerCase()}Id);`;

        const path = this.apiModule + basePath + "/resource/I" + this.mainClassName + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.otherClassName + "With" + this.mainClassName, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMethod");
        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.RequestMapping");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }

    private addMethodResourceClassBiDirectional(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    public ResponseEntity delete${this.otherClassName}With${this.mainClassName}(@PathVariable long ` +
            `${this.mainClassName.toLowerCase()}Id) {

        return ${this.mainClassName.toLowerCase()}Service.remove${this.otherClassName}` +
            `(${this.mainClassName.toLowerCase()}Id) ?
                ResponseEntity.ok().build() :
                ResponseEntity.notFound().build();
    }`;

        const path = this.apiModule + basePath + "/resource/" + this.mainClassName + "Controller.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "delete" + this.otherClassName + "With" + this.mainClassName, rawJavaMethod);

        javaFunctions.addImport(file, "org.springframework.web.bind.annotation.PathVariable");
        javaFunctions.addImport(file, "org.springframework.http.ResponseEntity");
    }

    private addMethodResourceClassUniDirectional(project: Project, basePath: string) {
        const rawJavaMethod = `
    @Override
    public ResponseEntity delete${this.otherClassName}With${this.mainClassName}(@PathVariable long ` +
            `${this.mainClassName.toLowerCase()}Id) {
        // Use only with @MapsId mapping
        long ${this.otherClassName.toLowerCase()}Id = ${this.mainClassName.toLowerCase()}Id;

        return ${this.otherClassName.toLowerCase()}Service.delete${this.otherClassName}(${this.otherClassName.toLowerCase()}Id) ?
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


export const addOneToOneDelete = new AddOneToOneDelete();
