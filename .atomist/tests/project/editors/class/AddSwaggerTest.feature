
Feature: Adds swagger configuration file and dependencies

  Scenario: AddSwagger should ad a swagger configuration file and dependencies
    Given a boot-api project structure
    When the AddSwagger is run
    Then new dependency to pom: springfox-swagger2
    Then new dependency to pom: springfox-swagger-ui
    Then new dependency to Api module pom: springfox-swagger2
    Then new dependency to Api module pom: springfox-swagger-ui
    Then a Swagger configuration file has been added to Api module
