
Feature: Adds an import to a Java class

  Scenario: addImport should add an import to a java class
    Given a java class
    When the addImport is run
    Then the class contains the new import
