import { File } from "@atomist/rug/model/File";
import { Project } from "@atomist/rug/model/Project";
import { EditFunction } from "../../EditFunction";
import { Params } from "../../Params";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";


export class AddFieldToPredicatesManyToMany extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const propertyInputHook = "// @Property input";
        const rawJavaPropertyCode = `private static final String ` +
            `${this.oneClass.toUpperCase()}_SET_PROPERTY = "${this.oneClass.toLowerCase()}Set";
    ` + propertyInputHook;

        const predicateInputHook = "// @Predicate input";
        const rawPredicateJavaCode = `sc.get${this.oneClass}Id().ifPresent(${this.oneClass.toLowerCase()}Id ` +
            `-> {
            Subquery<${this.oneClass}> subquery = criteriaQuery.subquery(${this.oneClass}.class);
            Root<${this.otherClass}> subRoot = subquery.correlate(root);
            Join<${this.otherClass}, ${this.oneClass}> ${this.otherClass.toLowerCase()}${this.oneClass}s = subRoot.join(${this.oneClass.toUpperCase()}_SET_PROPERTY);
            subquery.select(${this.otherClass.toLowerCase()}${this.oneClass}s).where(` +
            `criteria.equal(${this.otherClass.toLowerCase()}${this.oneClass}s.get(ID_PROPERTY), ${this.oneClass.toLowerCase()}Id));

            predicates.add(criteria.exists(subquery));
            });
    
        ` + predicateInputHook;

        const path = params.persistenceModule + params.basePath + "/persistence/db/repo/" + this.otherClass + "RepositoryImpl.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(predicateInputHook, rawPredicateJavaCode);
            file.replace(propertyInputHook, rawJavaPropertyCode);

            javaFunctions.addImport(file, "javax.persistence.criteria.Subquery");
            javaFunctions.addImport(file, "javax.persistence.criteria.Join");
        } else {
            console.error("Custom repository implementation class not added yet!");
        }
    }
}
