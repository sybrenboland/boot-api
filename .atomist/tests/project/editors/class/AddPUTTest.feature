
Feature: Adds methods to all layers implementing REST put method

  Scenario: AddPUT should add an implementation of the REST put method
    Given a boot-api project structure
    When the AddResource is run
    When the AddService is run
    When the AddPUT is run
    Then new dependency to pom: spring-boot-starter-web
    Then the method putAdres is added to resource/IAdresController in the Api module
    Then the method putAdres is added to resource/AdresController in the Api module
    Then the method updateAdres is added to service/AdresService in the Api module
