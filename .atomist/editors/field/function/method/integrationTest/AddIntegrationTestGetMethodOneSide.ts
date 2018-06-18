import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";


export class AddIntegrationTestGetMethodOneSide extends EditFunction {

    constructor(private oneClass: string, private otherClass: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        const rawJavaMethod = `
    @Test
    public void testGet${this.otherClass}_with${this.oneClass}With${this.otherClass}() throws Exception {
    
        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}With${this.otherClass}(` +
            `${this.oneClass.toLowerCase()}Repository, ${this.otherClass.toLowerCase()}Repository);
        IntegrationTestFactory.givenA${this.otherClass}(${this.otherClass.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity link returned.", response.getContentAsString().contains("/${this.otherClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.get${this.otherClass}().getId()));
    }

    @Test
    public void testGet${this.otherClass}_with${this.oneClass}No${this.otherClass}() throws Exception {
    
        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}(${this.oneClass.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity link returned.", response.getContentAsString().isEmpty());
    }

    @Test
    public void testGet${this.otherClass}_without${this.oneClass}() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity link returned.", response.getContentAsString().isEmpty());
    }`;

        const path = params.apiModule + "/src/main/test/java/integration/" + this.oneClass + "ResourceIT.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, `testGet${this.otherClass}_with${this.oneClass}With${this.otherClass}`, rawJavaMethod);

            javaFunctions.addImport(file, "org.junit.Test");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

        } else {
            console.error("Integration test class not added yet!");
        }
    }
}
