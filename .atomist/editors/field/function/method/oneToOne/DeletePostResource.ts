import { Params } from "../../Params";
import { EditFunction } from "../../EditFunction";
import { File } from "@atomist/rug/model/File";
import { Project } from "@atomist/rug/model/Project";

export class DeletePostResource extends EditFunction {

    constructor(private className: string) {
        super();
    }

    edit(project: Project, params: Params): void {

        const basePath = params.apiModule + "/src/main/java/" + params.basePackage.replace(/\./gi, "/") + "/api";

        this.deleteResourceClassMethod(project, basePath);
        this.deleteResourceInterfaceMethod(project, basePath);
        this.deletePutNewObjectIT(project, params);
        this.deletePostIT(project, params);
    }

    private deleteResourceInterfaceMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `\\Q@RequestMapping(value = "", method = RequestMethod.POST)\\E\\s\\s+` +
            `\\QResponseEntity post${this.className}(@RequestBody Json${this.className} ${this.className.toLowerCase()}) throws URISyntaxException;\\E`;

        const path = basePath + "/resource/I" + this.className + "Controller.java";
        const file: File = project.findFile(path);

        file.regexpReplace(rawJavaMethod, "");
    }

    private deleteResourceClassMethod(project: Project, basePath: string): void {

        const rawJavaMethod = `\\Q@Override\\E\\s\\s+` +
            `\\Qpublic ResponseEntity post${this.className}(@RequestBody Json${this.className} json${this.className}) ` +
            `throws URISyntaxException {\\E\\s\\s+` +
            `\\Q${this.className} new${this.className} = ${this.className.toLowerCase()}Service` +
            `.save(${this.className.toLowerCase()}Converter.fromJson(json${this.className}));\\E\\s\\s+` +
            `\\Qreturn ResponseEntity.status(HttpStatus.CREATED).body(${this.className.toLowerCase()}Converter.toJson(new${this.className}));\\E\\s\\s+` +
            `\\Q}\\E`;

        const path = basePath + "/resource/" + this.className + "Controller.java";
        const file: File = project.findFile(path);

        file.regexpReplace(rawJavaMethod, "");
    }

    private deletePutNewObjectIT(project: Project, params: Params) {

        const rawJavaMethod = `\\Q@Test\\E\\s\\s+\\Qpublic void testPut${this.className}_newObject()\\E[\\s\\S]*?` +
            `\\Q// @FieldInputAssert\\E\\s\\s+\\Q}\\E`;

        const path = params.apiModule + "/src/test/java/integration/" + this.className + "ResourceIT.java";
        const file: File = project.findFile(path);

        file.regexpReplace(rawJavaMethod, "");
    }

    private deletePostIT(project: Project, params: Params) {

        const rawJavaMethodInvalidObject = `\\Q@Test\\E\\s\\s+\\Qpublic void testPost${this.className}_invalidObject()\\E[\\s\\S]*?` +
            `\\Q// @FieldInputAssert\\E\\s\\s+\\Q}\\E`;

        const rawJavaMethodNewObject = `\\Q@Test\\E\\s\\s+\\Qpublic void testPost${this.className}_newObject()\\E[\\s\\S]*?` +
            `\\Q// @FieldInputAssert\\E\\s\\s+\\Q}\\E`;

        const path = params.apiModule + "/src/test/java/integration/" + this.className + "ResourceIT.java";
        const file: File = project.findFile(path);

        file.regexpReplace(rawJavaMethodInvalidObject, "");
        file.regexpReplace(rawJavaMethodNewObject, "");

    }
}
