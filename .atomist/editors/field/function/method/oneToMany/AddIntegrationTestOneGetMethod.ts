import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";


export class AddIntegrationTestOneGetMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {
        const rawJavaMethod = `
    @Test
    public void testGet${this.otherClass}s_with${this.oneClass}With${this.otherClass}s() throws Exception {

        ${this.oneClass} saved${this.oneClass} = givenA${this.oneClass}With${this.otherClass}();

        mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + saved${this.oneClass}.getId() + "/${this.otherClass.toLowerCase()}s"))
                .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    public void testGet${this.otherClass}s_with${this.oneClass}No${this.otherClass}s() throws Exception {

        ${this.oneClass} saved${this.oneClass} = givenA${this.oneClass}();

        mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + saved${this.oneClass}.getId() + "/${this.otherClass.toLowerCase()}s"))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }

    @Test
    public void testGet${this.otherClass}s_without${this.oneClass}() throws Exception {

        mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}s"))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }`;

        const path = params.apiModule + "/src/test/java/integration/" + this.oneClass + "ResourceIT.java";
        const file: File = project.findFile(path);
        javaFunctions.addFunction(file, `testGet${this.otherClass}s_with${this.oneClass}With${this.otherClass}s`, rawJavaMethod);

        javaFunctions.addImport(file, "org.junit.Test");
        javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
        javaFunctions.addImport(file, "org.springframework.test.web.servlet.result.MockMvcResultMatchers");
        javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
    }
}
