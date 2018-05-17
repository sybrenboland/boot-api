import { File } from "@atomist/rug/model/File";
import { Project } from "@atomist/rug/model/Project";
import { EditFunction } from "../../EditFunction";
import { Params } from "../../Params";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";


export class AddOtherRootToRepository extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const argumentDefinitionInputHook = "List<Predicate> createPredicates(";
        const rawJavaArgumentDefinition = argumentDefinitionInputHook + `CriteriaQuery<?> criteriaQuery, `;

        const propertyArgumentInputHook = "= createPredicates(";
        const rawJavaArgument = propertyArgumentInputHook + `criteriaQuery, `;

        const path = params.persistenceModule + params.basePath + "/persistence/db/repo/" + this.otherClass + "RepositoryImpl.java";
        const file: File = project.findFile(path);

        if (project.fileExists(path)) {
            file.replace(argumentDefinitionInputHook, rawJavaArgumentDefinition);
            file.replace(propertyArgumentInputHook, rawJavaArgument);

            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
        } else {
            console.error("Custom repository implementation class not added yet!");
        }
    }
}
