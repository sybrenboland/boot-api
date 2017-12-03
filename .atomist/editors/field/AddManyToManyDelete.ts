import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {javaFunctions} from "../functions/JavaClassFunctions";

export class AddManyToManyDelete {

    public addMethodServiceMappingSide(project: Project, basePath: string, classNameMapping: string, classNameOther: string,
                                   basePackage: string, apiModule: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean remove${classNameOther}(long ${classNameMapping.toLowerCase()}Id, ` +
            `long ${classNameOther.toLowerCase()}Id) {
        ${classNameMapping} ${classNameMapping.toLowerCase()} = ${classNameMapping.toLowerCase()}Repository.` +
            `findOne(${classNameMapping.toLowerCase()}Id);
        if (${classNameMapping.toLowerCase()} != null) {

            Optional<${classNameOther}> ${classNameOther.toLowerCase()}Optional = ${classNameMapping.toLowerCase()}.` +
            `get${classNameOther}Set().stream()
                    .filter(${classNameOther.toLowerCase()} -> ${classNameOther.toLowerCase()}.getId() == ` +
            `${classNameOther.toLowerCase()}Id).findFirst();

            if (${classNameOther.toLowerCase()}Optional.isPresent()) {
                ${classNameMapping.toLowerCase()}.remove${classNameOther}(${classNameOther.toLowerCase()}Optional.get());
                ${classNameMapping.toLowerCase()}Repository.save(${classNameMapping.toLowerCase()});
                return true;
            }
        }

        return false;
    }`;

        const path = apiModule + basePath + "/service/" + classNameMapping + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "remove" + classNameOther, rawJavaMethod);

        javaFunctions.addImport(file, basePackage + ".db.hibernate.bean." + classNameOther);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
    }

    public addMethodServiceOtherSide(project: Project, basePath: string, classNameMapping: string, classNameOther: string,
                                    basePackage: string, apiModule: string) {
        const rawJavaMethod = `
    @Transactional(propagation = Propagation.REQUIRED)
    public boolean remove${classNameMapping}(long ${classNameOther.toLowerCase()}Id, ` +
            `long ${classNameMapping.toLowerCase()}Id) {
        ${classNameOther} ${classNameOther.toLowerCase()} = ${classNameOther.toLowerCase()}Repository.` +
            `findOne(${classNameOther.toLowerCase()}Id);

        if (${classNameOther.toLowerCase()} != null) {
            ${classNameMapping} ${classNameMapping.toLowerCase()} = ${classNameMapping.toLowerCase()}Repository.` +
            `findOne(${classNameMapping.toLowerCase()}Id);
            if (${classNameMapping.toLowerCase()} != null) {

                ${classNameOther.toLowerCase()}.get${classNameMapping}Set().remove(${classNameMapping.toLowerCase()});
                ${classNameOther.toLowerCase()}Repository.save(${classNameOther.toLowerCase()});
                return true;
            }
        }

        return false;
    }`;

        const path = apiModule + basePath + "/service/" + classNameOther + "Service.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, "remove" + classNameMapping, rawJavaMethod);

        javaFunctions.addImport(file, basePackage + ".db.hibernate.bean." + classNameMapping);
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Propagation");
        javaFunctions.addImport(file, "org.springframework.transaction.annotation.Transactional");
    }
}


export const addManyToManyDelete = new AddManyToManyDelete();
