import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";


export class AddIntegrationTestOnePutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private oneSide: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {
        const getManySideClass = this.oneSide ?
            `saved${this.oneClass}.get${this.otherClass}List().get(0)` :
            `saved${this.oneClass}.get${this.otherClass}()`;

        const rawJavaMethod = `
    @Test
    public void testPut${this.otherClass}_with${this.oneClass}With${this.otherClass}() throws Exception {

        ${this.oneClass} saved${this.oneClass} = givenA${this.oneClass}With${this.otherClass}();
        ${this.otherClass} saved${this.otherClass} = ${getManySideClass};

        mockMvc.perform(MockMvcRequestBuilders.put("/${this.oneClass.toLowerCase()}s/"+ saved${this.oneClass}.getId()` +
            ` + "/${this.otherClass.toLowerCase()}s/" + saved${this.otherClass}.getId()))
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void testPut${this.otherClass}_with${this.oneClass}No${this.otherClass}() throws Exception {

        ${this.oneClass} saved${this.oneClass} = givenA${this.oneClass}();

        mockMvc.perform(MockMvcRequestBuilders.put("/${this.oneClass.toLowerCase()}s/"+ saved${this.oneClass}.getId() + "/${this.otherClass.toLowerCase()}s/-1"))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    public void testPut${this.otherClass}_without${this.oneClass}() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.put("/${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}s/-1"))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }`;

        const path = params.apiModule + "/src/test/java/integration/" + this.oneClass + "ResourceIT.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, `testPut${this.otherClass}_with${this.oneClass}With${this.otherClass}`, rawJavaMethod);

            javaFunctions.addImport(file, "org.junit.Test");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.result.MockMvcResultMatchers");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
        } else {
            console.error("Integration test class not added yet!");
        }
    }
}
