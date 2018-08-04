import {Params} from "../../Params";
import {EditFunction} from "../../EditFunction";
import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";
import {fileFunctions} from "../../../../functions/FileFunctions";

export class NoCreatePutResource extends EditFunction {

    constructor(private className: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        this.changeResourceMethod(project, params);
        this.changeUnitTest(project, params);
    }

    private changeResourceMethod(project: Project, params: Params) {

        const basePath = params.apiModule + "/src/main/java/" + fileFunctions.toPath(params.basePackage) + "/api";

        const rawJavaMethodOld = `saved${this.className} = ${this.className.toLowerCase()}Service` +
            `.save(${this.className.toLowerCase()}Converter.fromJson(json${this.className}));`;

        const rawJavaMethodNew = `return ResponseEntity.badRequest().build();`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);

        if (file.contains(rawJavaMethodOld)) {
            file.replace(rawJavaMethodOld, rawJavaMethodNew);
        }
    }

    private changeUnitTest(project: Project, params: Params) {

        const oldUnitTest = `\\Qpublic void testPut${this.className}_CreateNew${this.className}()\\E[\\s\\S]*?\\Qverify(${this.className.toLowerCase()}Converter, times(1)).toJson(any());\\E`;

        const newUnitTest = `public void testPut${this.className}_CreateNew${this.className}() {

        when(${this.className.toLowerCase()}Service.fetch${this.className}(${this.className.toUpperCase()}_ID)).thenReturn(Optional.empty());

        ResponseEntity response = ${this.className.toLowerCase()}Controller.put${this.className}(${this.className.toUpperCase()}_ID, json${this.className});

        assertNotNull("No response!", response);
        assertEquals("Wrong status code returned!", HttpStatus.BAD_REQUEST.value(), response.getStatusCodeValue());
        verify(${this.className.toLowerCase()}Converter, never()).fromJson(json${this.className});
        verify(${this.className.toLowerCase()}Converter, never()).fromJson(json${this.className}, ${this.className.toUpperCase()}_ID);
        verify(${this.className.toLowerCase()}Converter, never()).toJson(any());`;

        const path = `${params.apiModule}/src/test/java/${fileFunctions.toPath(params.basePackage)}/api/resource/${this.className}ControllerTest.java`;
        const file: File = project.findFile(path);

        if (file.containsMatch(oldUnitTest)) {
            file.regexpReplace(oldUnitTest, newUnitTest);
        }
    }
}
