
Feature: Adds methods to all layers implementing REST put method

  Scenario: AddPUT should add an implementation of the REST put method
    Given a boot-api project structure
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddPUT is run with className Adres
    Then new dependency to pom: spring-boot-starter-web
    Then the name putAdres is added to class IAdresController in package resource of the Api module
    Then the name putAdres is added to class AdresController in package resource of the Api module
    Then the name updateAdres is added to class AdresService in package service of the Api module
