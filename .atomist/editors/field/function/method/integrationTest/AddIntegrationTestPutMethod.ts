import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {javaFunctions} from "../../../../functions/JavaClassFunctions";
import {Project} from "@atomist/rug/model/Project";


export class AddIntegrationTestPutMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private oneSide: boolean, private biDirectional: boolean, private otherSideMany: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {
        const getManySideClass = this.oneSide ?
            `new ArrayList<>(${this.oneClass.toLowerCase()}.get${this.otherClass}Set()).get(0)` :
            `${this.oneClass.toLowerCase()}.get${this.otherClass}()`;

        const getCheck = this.otherSideMany ?
            `assertTrue("Wrong entity link returned.",
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}s"))
                        .andReturn().getResponse().getContentAsString()
                        .contains("/${this.otherClass.toLowerCase()}s/" + ${this.otherClass.toLowerCase()}.getId()));` :
            ``;

        const withExistingTest = this.biDirectional ?
            `
    @Test
    public void testPut${this.otherClass}_with${this.oneClass}() throws Exception {

        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}(${this.oneClass.toLowerCase()}Repository);
        ${this.otherClass} ${this.otherClass.toLowerCase()} = IntegrationTestFactory.givenA${this.otherClass}(${this.otherClass.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.put("/${this.oneClass.toLowerCase()}s/" + ` +
            `${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}s/" + ${this.otherClass.toLowerCase()}.getId()))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
        ${getCheck}
    }
    
    @Test
    public void testPut${this.otherClass}_with${this.oneClass}With${this.otherClass}() throws Exception {
    
        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}With${this.otherClass}(` +
            `${this.oneClass.toLowerCase()}Repository, ${this.otherClass.toLowerCase()}Repository);
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${getManySideClass};

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.put("/${this.oneClass.toLowerCase()}s/" + ` +
            `${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}s/" + ${this.otherClass.toLowerCase()}.getId()))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
        ${getCheck}
    }
` :
            ``;

        const rawJavaMethod = `
    ${withExistingTest}
    @Test
    public void testPut${this.otherClass}_with${this.oneClass}No${this.otherClass}() throws Exception {
    
        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}(${this.oneClass.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.put("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}s/-1"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }

    @Test
    public void testPut${this.otherClass}_without${this.oneClass}() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.put("/${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}s/-1"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }`;

        const path = params.apiModule + "/src/main/test/java/integration/" + this.oneClass + "ResourceIT.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, `testPut${this.otherClass}_with${this.oneClass}With${this.otherClass}`, rawJavaMethod);

            if (this.oneSide) {
                javaFunctions.addImport(file, "java.util.ArrayList");
            }
            javaFunctions.addImport(file, "org.junit.Test");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
        } else {
            console.error("Integration test class not added yet!");
        }
    }
}
