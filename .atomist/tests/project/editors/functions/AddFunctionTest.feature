
Feature: Adds a function to a Java class

  Scenario: addFunction should add a function to a java class
    Given a java class
    When the addFunction is run
    Then the class contains the new function
