import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";


export class AddIntegrationTestDeleteMethodUni extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        const rawJavaMethod = `
    @Test
    public void testDelete${this.otherClass}_with${this.oneClass}With${this.otherClass}() throws Exception {
    
        ${this.otherClass} ${this.otherClass.toLowerCase()} = IntegrationTestFactory.givenA${this.otherClass}(${this.otherClass.toLowerCase()}Repository);
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.otherClass.toLowerCase()}.get${this.oneClass}();

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.delete("/${this.oneClass.toLowerCase()}s/" + ` +
            `${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }

    @Test
    public void testDelete${this.otherClass}_with${this.oneClass}No${this.otherClass}() throws Exception {
    
        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}(${this.oneClass.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.delete("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }

    @Test
    public void testDelete${this.otherClass}_without${this.oneClass}() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.delete("${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
        

        mockMvc.perform(MockMvcRequestBuilders.delete("/${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}"))
                .andExpect(MockMvcResultMatchers.status().isNotFound());
    }`;

        const path = params.apiModule + "/src/main/test/java/integration/" + this.oneClass + "ResourceIT.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, `testDelete${this.otherClass}_with${this.oneClass}With${this.otherClass}`, rawJavaMethod);

            javaFunctions.addImport(file, "org.junit.Test");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.result.MockMvcResultMatchers");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
        } else {
            console.error("Integration test class not added yet!");
        }
    }
}
