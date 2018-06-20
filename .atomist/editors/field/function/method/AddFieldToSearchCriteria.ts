import {EditFunction} from "../EditFunction";
import {Params} from "../Params";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import { fileFunctions } from "../../../functions/FileFunctions";
import {javaFunctions} from "../../../functions/JavaClassFunctions";


export class AddFieldToSearchCriteria extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private mappingSide: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.addFieldToSearchCriteria(project, params);
        this.addFieldToUnitTest(project, params);
    }

    private addFieldToSearchCriteria(project: Project, params: Params) {

        const inputHook = "// @Input";
        const rawJavaCode = `@Builder.Default
    private Optional<Long> ${this.oneClass.toLowerCase()}Id = Optional.empty();
    
    ` + inputHook;

        const path = params.persistenceModule + params.basePath + "/persistence/criteria/" + this.otherClass + "SearchCriteria.java";
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawJavaCode);
        } else {
            console.error("SearchCriteria class not added yet!");
        }
    }

    private addFieldToUnitTest(project: Project, params: Params) {

        const path = `${params.persistenceModule}/src/test/java/${fileFunctions.toPath(params.basePackage)}/persistence/db/repo/${this.otherClass}RepositoryImplTest.java`;
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);

            const injectInputHook = '// @InjectInput';
            const rawInject = `@Autowired
    private ${this.oneClass}Repository ${this.oneClass.toLowerCase()}Repository;
    
    ` + injectInputHook;
            file.replace(injectInputHook, rawInject);

            if (this.mappingSide) {
                const deleteInputHook = '// @TearDownInputTop';
                const rawDelete = deleteInputHook +`
                ${this.oneClass.toLowerCase()}Repository.deleteAll();`;
                file.replace(deleteInputHook, rawDelete);
            } else {
                const deleteInputHook = '// @TearDownInputBottom';
                const rawDelete = `${this.oneClass.toLowerCase()}Repository.deleteAll();
                ` + deleteInputHook;
                file.replace(deleteInputHook, rawDelete);
            }

            const parameterInputHook = '// @ParameterInput';
            const rawParameters = parameterInputHook + `
            
    private ${this.oneClass} ${this.oneClass.toLowerCase()};
    private ${this.oneClass} ${this.oneClass.toLowerCase()}Diff;`;
            file.replace(parameterInputHook, rawParameters);

            const beanCreationInputHook = '// @ObjectCreationInput';
            const rawBeanCreation = file.firstMatch(`\\Q${this.otherClass.toLowerCase()}Repository.save(\\E[\\s\\S]*?\\Q.build());\\E`);

            const fieldInputHook = '// @FieldInput';
            const rawFieldInput = `.${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()})
                `;
            file.replace(fieldInputHook, rawFieldInput + fieldInputHook);
            javaFunctions.addImport(file, `${params.basePackage}.persistence.db.hibernate.bean.${this.oneClass}`);

            file.replace(beanCreationInputHook, rawBeanCreation.replace(fieldInputHook, `.${this.oneClass.toLowerCase()}(${this.oneClass.toLowerCase()}Diff)
                ` + fieldInputHook) + `
                
        ` + beanCreationInputHook
            );

            const subBeanCreationInputHook = '// @SubObjectCreationInput';
            const rawSubBeanCreation = subBeanCreationInputHook + `      
              
        ${this.oneClass.toLowerCase()} = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder().build());
        ${this.oneClass.toLowerCase()}Diff = ${this.oneClass.toLowerCase()}Repository.save(${this.oneClass}.builder().build());`;
            file.replace(subBeanCreationInputHook, rawSubBeanCreation);

            const criteriaInputHook = '// @CriteriaInput';
            const rawCriteria = `.${this.oneClass.toLowerCase()}Id(Optional.of(${this.oneClass.toLowerCase()}.getId()))
                `;
            file.replace(criteriaInputHook, rawCriteria + criteriaInputHook);

            const criteriaDiffInputHook = '// @CriteriaDiffInput';
            const rawCriteriaDiff = `.${this.oneClass.toLowerCase()}Id(Optional.of(${this.oneClass.toLowerCase()}Diff.getId()))
                `;
            file.replace(criteriaDiffInputHook, rawCriteriaDiff + criteriaDiffInputHook);

            const unitTestInputHook = '// @Input';
            const rawUnitTests = `

    @Test
    public void testFindNumberOf${this.otherClass}BySearchCriteria_With${this.oneClass}Property() {

        ${this.otherClass}SearchCriteria searchCriteria = ${this.otherClass}SearchCriteria.builder()
                .${this.oneClass.toLowerCase()}Id(Optional.of(${this.oneClass.toLowerCase()}Diff.getId()))
                .build();

        int result = ${this.otherClass.toLowerCase()}Repository.findNumberOf${this.otherClass}BySearchCriteria(searchCriteria);

        assertEquals("Wrong number of objects returned!", 1, result);
    }
            
    @Test
    public void testFindBySearchCriteria_With${this.oneClass}Property() {

        ${this.otherClass}SearchCriteria searchCriteria = ${this.otherClass}SearchCriteria.builder()
                .${this.oneClass.toLowerCase()}Id(Optional.of(${this.oneClass.toLowerCase()}Diff.getId()))
                .build();

        List<${this.otherClass}> result = ${this.otherClass.toLowerCase()}Repository.findBySearchCriteria(searchCriteria);

        assertEquals("Wrong number of objects returned!", 1, result.size());
    }

`;
            file.replace(unitTestInputHook, unitTestInputHook + rawUnitTests);

        } else {
            console.error("Repository Impl unit test class not added yet!");
        }
    }
}
