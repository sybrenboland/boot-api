
Feature: Finds a file on specified path

  Scenario: findFile should return the file if it exists for that path
    Given a file exists
    When the findFile is run
    Then the file is returned
