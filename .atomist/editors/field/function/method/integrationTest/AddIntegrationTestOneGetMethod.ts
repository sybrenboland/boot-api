import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { javaFunctions } from "../../../../functions/JavaClassFunctions";
import { Project } from "@atomist/rug/model/Project";


export class AddIntegrationTestOneGetMethod extends EditFunction {

    constructor(private oneClass: string, private otherClass: string, private oneSide: boolean, private biDirectional: boolean) {
        super();
    }

    edit(project: Project, params: Params): void {

        let getObjects;

        if (this.oneSide) {
            if (this.biDirectional) {
                getObjects = `${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}With${this.otherClass}(` +
                    `${this.oneClass.toLowerCase()}Repository, ${this.otherClass.toLowerCase()}Repository);
                    cleanUpSet${this.oneClass}.add(${this.oneClass.toLowerCase()}.getId());
                    ${this.otherClass} ${this.otherClass.toLowerCase()} = new ArrayList<>(${this.oneClass.toLowerCase()}.get${this.otherClass}Set()).get(0);
                    cleanUpSet${this.otherClass}.add(${this.otherClass.toLowerCase()}.getId());`
            } else {
                getObjects = `${this.otherClass} ${this.otherClass.toLowerCase()} = IntegrationTestFactory.givenA${this.otherClass}With${this.oneClass}(` +
                    `${this.otherClass.toLowerCase()}Repository, ${this.oneClass.toLowerCase()}Repository);
                    cleanUpSet${this.otherClass}.add(${this.otherClass.toLowerCase()}.getId());
                    ${this.oneClass} ${this.oneClass.toLowerCase()} = ${this.otherClass.toLowerCase()}.get${this.oneClass}();
                    cleanUpSet${this.oneClass}.add(${this.oneClass.toLowerCase()}.getId());`
            }
        } else {
            getObjects = `${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}With${this.otherClass}(` +
                `${this.oneClass.toLowerCase()}Repository, ${this.otherClass.toLowerCase()}Repository);
                cleanUpSet${this.oneClass}.add(${this.oneClass.toLowerCase()}.getId());
                ${this.otherClass} ${this.otherClass.toLowerCase()} = ${this.oneClass.toLowerCase()}.get${this.otherClass}();
                cleanUpSet${this.otherClass}.add(${this.otherClass.toLowerCase()}.getId());`
        }

        const rawJavaMethod = `
    @Test
    public void testGet${this.otherClass}s_with${this.oneClass}With${this.otherClass}s() throws Exception {
    
        ${getObjects}

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}s"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.OK.value(), response.getStatus());
        assertTrue("Wrong entity link returned.", response.getContentAsString().contains("/${this.otherClass.toLowerCase()}s/" + ${this.otherClass.toLowerCase()}.getId()));
    }

    @Test
    public void testGet${this.otherClass}s_with${this.oneClass}No${this.otherClass}s() throws Exception {
    
        ${this.oneClass} ${this.oneClass.toLowerCase()} = IntegrationTestFactory.givenA${this.oneClass}(${this.oneClass.toLowerCase()}Repository);
        cleanUpSet${this.oneClass}.add(${this.oneClass.toLowerCase()}.getId());

        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/" + ${this.oneClass.toLowerCase()}.getId() + "/${this.otherClass.toLowerCase()}s"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }

    @Test
    public void testGet${this.otherClass}s_without${this.oneClass}() throws Exception {
    
        MockHttpServletResponse response =
                mockMvc.perform(MockMvcRequestBuilders.get("/${this.oneClass.toLowerCase()}s/-1/${this.otherClass.toLowerCase()}s"))
                        .andReturn().getResponse();

        assertEquals("Wrong status code returned.", HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertTrue("Wrong entity returned.", response.getContentAsString().isEmpty());
    }`;

        const path = params.apiModule + "/src/test/java/integration/" + this.oneClass + "ResourceIT.java";

        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            javaFunctions.addFunction(file, `testGet${this.otherClass}s_with${this.oneClass}With${this.otherClass}s`, rawJavaMethod);

            if (this.oneSide && this.biDirectional) {
                javaFunctions.addImport(file, "java.util.ArrayList");
            }
            javaFunctions.addImport(file, "org.junit.Test");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.request.MockMvcRequestBuilders");
            javaFunctions.addImport(file, "org.springframework.test.web.servlet.result.MockMvcResultMatchers");
            javaFunctions.addImport(file, params.basePackage + ".persistence.db.hibernate.bean." + this.oneClass);
        } else {
            console.error("Integration test class not added yet!");
        }
    }
}
