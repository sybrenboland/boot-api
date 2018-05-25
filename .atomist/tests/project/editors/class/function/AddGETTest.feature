
Feature: Adds methods to all layers implementing REST get method

  Scenario: AddGET should add an implementation of the REST get method
    When the NewMavenProject is run
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddIntegrationTestSetup is run for class Adres
    When the AddGET is run with className Adres
    Then new dependency to pom: spring-boot-starter-web
    Then the name getAdres is added to class IAdresController in package api.resource of the Api module
    Then the name getAdres is added to class AdresController in package api.resource of the Api module
    Then the name fetchAdres is added to class AdresService in package core.service of the Core module
    Then the test testGetAdres_withAdres is added to the integration tests of class Adres
