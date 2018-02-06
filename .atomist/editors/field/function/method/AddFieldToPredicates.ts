import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";


export class AddFieldToPredicates extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const propertyInputHook = "// @Property input";
        const rawJavaPropertyCode = `private static final String ` +
            `${this.oneClass.toUpperCase()}_PROPERTY = "${this.oneClass.toLowerCase()}";
    ` + propertyInputHook;

        const predicateInputHook = "// @Predicate input";
        const rawPredicateJavaCode = `sc.get${this.oneClass}Id().ifPresent(${this.oneClass.toLowerCase()}Id ` +
            `-> predicates.add(criteria.equal(root.get(${this.oneClass.toUpperCase()}_PROPERTY).get(ID_PROPERTY), ` +
            `${this.oneClass.toLowerCase()}Id)));
    
        ` + predicateInputHook;

        const path = params.persistenceModule + params.basePath + "/db/repo/" + this.otherClass + "RepositoryImpl.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(predicateInputHook, rawPredicateJavaCode);
            file.replace(propertyInputHook, rawJavaPropertyCode);
        } else {
            console.error("Custom repository implementation class not added yet!");
        }
    }
}