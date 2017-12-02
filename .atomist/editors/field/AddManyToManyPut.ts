import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../functions/JavaClassFunctions";

export class AddManyToManyPut {

    public addMethodServiceMappingSide(project: Project, basePath: string, classNameMapping: string, classNameOther: string,
                                   basePackage: string, apiModule: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean update${classNameMapping}With${classNameOther}(long ${classNameMapping.toLowerCase()}Id, ` +
            `long ${classNameOther.toLowerCase()}Id) {
        ${classNameMapping} ${classNameMapping.toLowerCase()} = ${classNameMapping.toLowerCase()}Repository.` +
            `findOne(${classNameMapping.toLowerCase()}Id);
        if (${classNameMapping.toLowerCase()} != null) {

            ${classNameOther} ${classNameOther.toLowerCase()} = ${classNameOther.toLowerCase()}Repository.` +
            `findOne(${classNameOther.toLowerCase()}Id);
            if (${classNameOther.toLowerCase()} != null) {

                ${classNameMapping.toLowerCase()}.add${classNameOther}(${classNameOther.toLowerCase()});
                ${classNameMapping.toLowerCase()}Repository.save(${classNameMapping.toLowerCase()});
                return true;
            }
        }

        return false;
    }`;

        const path = apiModule + basePath + "/service/" + classNameMapping + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + classNameMapping + "With" + classNameOther, rawJavaMethod);

        javaFunctions.addImport(file, basePackage + ".db.hibernate.bean." + classNameOther);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");

        javaFunctions.addToConstructor(file, classNameMapping + "Service",
            classNameOther.toLowerCase() + "Repository");
        javaFunctions.addImport(file, basePackage + ".db.repo." + classNameOther + "Repository");
    }

    public addMethodServiceOtherSide(project: Project, basePath: string, classNameMapping: string, classNameOther: string,
                                    basePackage: string, apiModule: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean update${classNameOther}With${classNameMapping}(long ${classNameOther.toLowerCase()}Id, ` +
            `long ${classNameMapping.toLowerCase()}Id) {
        ${classNameOther} ${classNameOther.toLowerCase()} = ${classNameOther.toLowerCase()}Repository.` +
            `findOne(${classNameOther.toLowerCase()}Id);
        if (${classNameOther.toLowerCase()} != null) {

            ${classNameMapping} ${classNameMapping.toLowerCase()} = ${classNameMapping.toLowerCase()}Repository.` +
            `findOne(${classNameMapping.toLowerCase()}Id);
            if (${classNameMapping.toLowerCase()} != null) {

                ${classNameOther.toLowerCase()}.get${classNameMapping}Set().add(${classNameMapping.toLowerCase()});
                ${classNameOther.toLowerCase()}Repository.save(${classNameOther.toLowerCase()});
                return true;
            }
        }

        return false;
    }`;

        const path = apiModule + basePath + "/service/" + classNameOther + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "update" + classNameOther + "With" + classNameMapping, rawJavaMethod);

        javaFunctions.addImport(file, basePackage + ".db.hibernate.bean." + classNameMapping);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");

        javaFunctions.addToConstructor(file, classNameOther + "Service",
            classNameMapping.toLowerCase() + "Repository");
        javaFunctions.addImport(file, basePackage + ".db.repo." + classNameMapping + "Repository");
    }
}

export const addManyToManyPut = new AddManyToManyPut();
