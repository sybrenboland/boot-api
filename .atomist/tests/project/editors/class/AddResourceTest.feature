
Feature: Add resource class and interface to api module

  Scenario: AddResource should add a respource class and interface to the api module
    Given a boot-api project structure
    When the AddResource is run
    Then new dependency to pom: spring-boot-starter-web
    Then a resource class is added to the Api module
    Then a resource interface is added to the Api module
