import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";


export class AddIntegrationTestGetMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private biDirectional: boolean, private otherSideMany: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        let getObjects;

        if (this.biDirectional) {
            getObjects = `${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}With${this.otherClass}(` +
                `${this.oneClass.toLowerCase()}Repository, ${this.otherClass.toLowerCase()}Repository);
            IntegrationTestFactory.givenA${this.otherClass}(${this.otherClass.toLowerCase()}Repository);`
        } else {
            if (this.otherSideMany) {
                getObjects = `${this.otherClass} ${this.otherClass.toLowerCase()} = IntegrationTestFactory.givenA${this.otherClass}With${this.oneClass}(` +
                    `${this.otherClass.toLowerCase()}Repository, ${this.oneClass.toLowerCase()}Repository);
            ${this.oneClass} ${this.oneClass.toLowerCase()} = new ArrayList<>(${this.otherClass.toLowerCase()}.get${this.oneClass}Set()).get(0);`
            } else {
                getObjects = `${this.otherClass} ${this.otherClass.toLowerCase()} = IntegrationTestFactory.givenA${this.otherClass}With${this.oneClass}(` +
                    `${this.otherClass.toLowerCase()}Repository, ${this.oneClass.toLowerCase()}Repository);
            ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.otherClass.toLowerCase()}.get${this.oneClass}();`;
            }
        }

        const rawJavaMethod = `
    @Test
    public void testGet${this.otherClass}s_with${this.oneClass}With${this.otherClass}s() throws Exception {
    
        ${getObjects}

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}s"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong grand total returned.", response.getContentAsString().contains("\\"grandTotal\\":1"));
        assertTrue("Wrong number of results returned.", response.getContentAsString().contains("\\"numberOfResults\\":1"));
    }

    @Test
    public void testGet${this.otherClass}s_with${this.oneClass}No${this.otherClass}s() throws Exception {
    
        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}(${this.oneClass.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}s"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong grand total returned.", response.getContentAsString().contains("\\"grandTotal\\":0"));
        assertTrue("Wrong number of results returned.", response.getContentAsString().contains("\\"numberOfResults\\":0"));
        assertTrue("Wrong entities returned.", response.getContentAsString().contains("\\"results\\":[]"));
    }

    @Test
    public void testGet${this.otherClass}s_without${this.oneClass}() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}s"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong grand total returned.", response.getContentAsString().contains("\\"grandTotal\\":0"));
        assertTrue("Wrong number of results returned.", response.getContentAsString().contains("\\"numberOfResults\\":0"));
        assertTrue("Wrong entities returned.", response.getContentAsString().contains("\\"results\\":[]"));
    }`;

        const path = params.apiModule + "/src/test/java/integration/" + this.oneClass + "ResourceIT.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, `testGet${this.otherClass}s_with${this.oneClass}With${this.otherClass}s`, rawJavaMethod);

            if (this.biDirectional) {
                javaFunctions.addImport(file, "java.util.ArrayList");
            }
            javaFunctions.addImport(file, "org.junit.Test");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.result.MockMvcResultMatchers");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);

        } else {
            console.error("Integration test class not added yet!");
        }
    }
}
