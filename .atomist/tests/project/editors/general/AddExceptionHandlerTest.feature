
Feature: Add Exception Handler should add a exception handler class

  Scenario: AddExceptionHandler should add a exception handler class with the given response
    When the NewMavenProject is run
    When the AddExceptionHandler is run for "URISyntaxException" of package "java.net" to return http "conflict" with message: "Conflict!"
    Then new dependency to pom: "spring-boot-starter-web"
    Then the name "URISyntaxException" is added to class "ResourceURISyntaxExceptionHandler" in package "api.exception" of the "Api" module
    Then the name "HttpStatus.CONFLICT" is added to class "ResourceURISyntaxExceptionHandler" in package "api.exception" of the "Api" module
    Then the name "Conflict!" is added to class "ResourceURISyntaxExceptionHandler" in package "api.exception" of the "Api" module
    Then the unit test for "handleConflict" is added for the class "ResourceURISyntaxExceptionHandler" in the package "api.exception" of the "Api" module
