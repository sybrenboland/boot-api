import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {fileFunctions} from "../../../../functions/FileFunctions";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";

export class ExtendRepositoryUnitTestWithRelation extends EditFunction {

    constructor(private classNameMappedBy: string, private classNameOther: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        const fieldInputHook = '// @FieldInput';
        const relation = `.${this.classNameMappedBy.toLowerCase()}(${this.classNameMappedBy}.builder().build())
                `;

        const path = `${params.persistenceModule}/src/test/java/${fileFunctions.toPath(params.basePackage)}/persistence/db/repo/${this.classNameOther}RepositoryImplTest.java`;

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);

            file.replace(fieldInputHook, relation + fieldInputHook);
            javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.classNameMappedBy}`);
        } else {
            console.error("Repository implementation class not added yet!");
        }
    }
}
