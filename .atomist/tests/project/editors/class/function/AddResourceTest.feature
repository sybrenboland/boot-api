
Feature: Add resource class and interface to api module

  Scenario: AddResource should add a respource class and interface to the api module
    When the NewMavenProject is run
    When the AddResource is run with className "Adres"
    Then new dependency to pom: "spring-boot-starter-web"
    Then a resource class is added
    Then a resource interface is added
