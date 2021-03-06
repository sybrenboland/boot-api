
Feature: Add converter should add a converter class to the api module

  Scenario: AddConverter should add a converter class
    When the NewMavenProject is run
    When the AddConverter is run with className "Adres"
    Then a converter class is added to the api module
    Then the converter class contains a method: "toJson"
    Then the converter class contains a method: "fromJson"
