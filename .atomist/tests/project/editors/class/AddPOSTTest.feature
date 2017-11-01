
Feature: Adds methods to all layers implementing REST post method

  Scenario: AddPOST should add an implementation of the REST post method
    Given a boot-api project structure
    When the AddResource is run
    When the AddService is run
    When the AddPOST is run
    Then new dependency to pom: spring-boot-starter-web
    Then the method postAdres is added to resource/IAdresController in the Api module
    Then the method postAdres is added to resource/AdresController in the Api module
    Then the method createAdres is added to service/AdresService in the Api module
