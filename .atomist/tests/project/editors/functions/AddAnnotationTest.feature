
Feature: Adds an annotation to a Java class

  Scenario: addAnnotation should add an annotation to a java class
    Given a java class
    When the addAnnotation is run
    Then the class contains the new annotation
