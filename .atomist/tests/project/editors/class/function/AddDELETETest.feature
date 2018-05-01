
Feature: Adds methods to all layers implementing REST put method

  Scenario: AddPUT should add an implementation of the REST put method
    When the NewMavenProject is run
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddIntegrationTestSetup is run for class Adres
    When the AddDELETE is run with className Adres
    Then new dependency to pom: spring-boot-starter-web
    Then the name deleteAdres is added to class IAdresController in package resource of the Api module
    Then the name deleteAdres is added to class AdresController in package resource of the Api module
    Then the name deleteAdres is added to class AdresService in package service of the Core module
    Then the test testDeleteAdres_unknownObject is added to the integration tests of class Adres
