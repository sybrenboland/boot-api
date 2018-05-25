import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";


export class AddIntegrationTestOneGetMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private mappedBySide: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        const getObjects = this.mappedBySide ?
            `${this.otherClass} ${this.otherClass.toLowerCase()} = IntegrationTestFactory.givenA${this.otherClass}(${this.otherClass.toLowerCase()}Repository);
        ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.otherClass.toLowerCase()}.get${this.oneClass}();` :
            `${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}(${this.oneClass.toLowerCase()}Repository);
        ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.oneClass.toLowerCase()}.get${this.otherClass}();`;

        const methodOtherSideNotPresent = this.mappedBySide ?
            `
            @Test
    public void testGet${this.otherClass}_with${this.oneClass}No${this.otherClass}() throws Exception {
    
        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}(${this.oneClass.toLowerCase()}Repository);

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }
    ` :
            ``;

        const rawJavaMethod = `
    @Test
    public void testGet${this.otherClass}_with${this.oneClass}With${this.otherClass}() throws Exception {
    
        ${getObjects}

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity link returned.", response.getContentAsString().contains("/${this.otherClass.toLowerCase()}s/" + ${this.otherClass.toLowerCase()}.getId()));
    }
    ${methodOtherSideNotPresent}
    @Test
    public void testGet${this.otherClass}_without${this.oneClass}() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }`;

        const path = params.apiModule + "/src/test/java/integration/" + this.oneClass + "ResourceIT.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, `testGet${this.otherClass}_with${this.oneClass}With${this.otherClass}`, rawJavaMethod);

            javaFunctions.addImport(file, "org.junit.Test");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.otherClass);
        } else {
            console.error("Integration test class not added yet!");
        }
    }
}
