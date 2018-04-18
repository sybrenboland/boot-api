import {Pom} from "@atomist/rug/model/Pom";
import {Project} from "@atomist/rug/model/Project";
import {Editor, Parameter, Tags} from "@atomist/rug/operations/Decorators";
import {EditProject} from "@atomist/rug/operations/ProjectEditor";
import {Pattern} from "@atomist/rug/operations/RugOperation";
import {PathExpressionEngine} from "@atomist/rug/tree/PathExpression";

/**
 * AddExceptionHandler editor
 * - Adds maven dependencies
 * - Adds exception handler class
 */
@Editor("AddExceptionHandler", "adds exception handler")
@Tags("rug", "exception", "error", "response", "shboland")
export class AddExceptionHandler implements EditProject {
    @Parameter({
        displayName: "The exception",
        description: "Name of the exception we want handled",
        pattern: Pattern.java_class,
        validInput: "Java exception",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public javaException: string;

    @Parameter({
        displayName: "The package of the exception",
        description: "The package of the exception we have to import",
        pattern: Pattern.java_package,
        validInput: "Java package",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public exceptionPackage: string;

    @Parameter({
        displayName: "Response",
        description: "Name of the http response we want to return",
        pattern: Pattern.any,
        validInput: "Name of a http response",
        minLength: 1,
        maxLength: 100,
        required: true,
    })
    public httpResponse: string;

    @Parameter({
        displayName: "Base package name",
        description: "Name of the base package in witch we want to add",
        pattern: Pattern.java_package,
        validInput: "Java package name",
        minLength: 0,
        maxLength: 100,
        required: true,
    })
    public basePackage: string;

    @Parameter({
        displayName: "Name of the api module",
        description: "Name of the module we want to add",
        pattern: Pattern.any,
        validInput: "Name",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public apiModule: string = "api";

    @Parameter({
        displayName: "Message",
        description: "Message we want to return in case of the error",
        pattern: Pattern.any,
        validInput: "Any message",
        minLength: 0,
        maxLength: 100,
        required: false,
    })
    public responseMessage: string = "";

    public edit(project: Project) {

        const basePath = this.apiModule + "/src/main/java/" +
            this.basePackage.replace(/\./gi, "/") + "/api";

        this.addDependencies(project);
        this.addHandlerClass(project, basePath);
    }

    private addDependencies(project: Project): void {
        const eng: PathExpressionEngine = project.context.pathExpressionEngine;

        eng.with<Pom>(project, "/Pom()", pom => {
            pom.addOrReplaceDependency("org.springframework.boot", "spring-boot-starter-web");
        });
    }

    private addHandlerClass(project: Project, basePath: string): void {

        const responseMessage = this.responseMessage != "" ?
            this.responseMessage :
            "There seems to be a problem with application.";

        const rawJavaFileContent = `package ${this.basePackage}.api.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import ${this.exceptionPackage}.${this.javaException};

@ControllerAdvice
public class Resource${this.javaException}Handler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = { ${this.javaException}.class })
    public ResponseEntity<Object> handleConflict(Exception ex, WebRequest request) {
        String bodyOfResponse = "${responseMessage}";
        return handleExceptionInternal(ex, bodyOfResponse, new HttpHeaders(), ` +
            `HttpStatus.${this.httpResponse.toUpperCase()}, request);
    }
}
`;

        const path = basePath + "/exception/Resource" + this.javaException + "Handler.java";
        if (!project.fileExists(path)) {
            project.addFile(path, rawJavaFileContent);
        }
    }
}

export const addExceptionHandler = new AddExceptionHandler();
