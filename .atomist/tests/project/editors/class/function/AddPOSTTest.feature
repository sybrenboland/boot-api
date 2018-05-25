
Feature: Adds methods to all layers implementing REST post method

  Scenario: AddPOST should add an implementation of the REST post method
    When the NewMavenProject is run
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddIntegrationTestSetup is run for class Adres
    When the AddPOST is run with className Adres
    Then new dependency to pom: spring-boot-starter-web
    Then the name postAdres is added to class IAdresController in package api.resource of the Api module
    Then the name postAdres is added to class AdresController in package api.resource of the Api module
    Then the name save is added to class AdresService in package core.service of the Core module
    Then the name URISyntaxException is added to class ResourceURISyntaxExceptionHandler in package api.exception of the Api module
    Then the test testPostAdres_invalidObject is added to the integration tests of class Adres
