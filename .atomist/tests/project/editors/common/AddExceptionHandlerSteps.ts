import {Project} from "@atomist/rug/model/Project";
import {ProjectScenarioWorld, When} from "@atomist/rug/test/project/Core";
import {ApiModule, BasePackage} from "../../common/Constants";

When("the AddExceptionHandler is run for (.*) of package (.*) to return http (.*) with message: (.*)",
    (p: Project, w: ProjectScenarioWorld, javaException: string, exceptionPackage: string,
     httpStatus: string, responseMessage: string) => {

        const editor = w.editor("AddExceptionHandler");
        w.editWith(editor, {
            javaException: javaException,
            exceptionPackage: exceptionPackage,
            httpResponse: httpStatus,
            basePackage: BasePackage,
            apiModule: ApiModule,
            responseMessage: responseMessage,
        });
    });
