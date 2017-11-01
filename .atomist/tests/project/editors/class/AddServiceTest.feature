
Feature: Add service class to api module

  Scenario: AddService should add a service class to the api module
    Given a boot-api project structure
    When the AddService is run
    Then a service class is added to the Api module
