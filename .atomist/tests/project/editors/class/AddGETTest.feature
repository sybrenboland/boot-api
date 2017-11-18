
Feature: Adds methods to all layers implementing REST get method

  Scenario: AddGET should add an implementation of the REST get method
    Given a boot-api project structure
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddGET is run with className Adres
    Then new dependency to pom: spring-boot-starter-web
    Then the method getAdres is added to resource/IAdresController in the Api module
    Then the method getAdres is added to resource/AdresController in the Api module
    Then the method fetchAdres is added to service/AdresService in the Api module
