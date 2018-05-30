
Feature: Add service class to api module

  Scenario: AddService should add a service class to the api module
    When the NewMavenProject is run
    When the AddService is run with className "Adres"
    Then a service class is added
