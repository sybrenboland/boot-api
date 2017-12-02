
Feature: Add field class should add a given field to the api chain

  Scenario: AddField should add a basic field to the chain
    Given a boot-api project structure
    When the AddExceptionHandler is run for URISyntaxException of package java.net to return http conflict with message: Conflict!
    Then new dependency to pom: spring-boot-starter-web
    Then the name URISyntaxException is added to class ResourceURISyntaxExceptionHandler in package exception of the Api module
    Then the name HttpStatus.CONFLICT is added to class ResourceURISyntaxExceptionHandler in package exception of the Api module
    Then the name Conflict! is added to class ResourceURISyntaxExceptionHandler in package exception of the Api module
