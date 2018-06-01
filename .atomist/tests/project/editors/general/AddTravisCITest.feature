
Feature: Add Travis CI should add travis config file

  Scenario: Add Travis CI should add travis config file
    When the AddTravisCI is run
    Then a travis config file is added to the root directory
