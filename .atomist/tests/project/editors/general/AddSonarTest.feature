
Feature: Add Travis CI should add travis config file

  Scenario: Add Travis CI should add travis config file
    When the AddTravisCI is run
    When the AddSonar is run
    Then the name "sonar-scanner" is added to the travis file
    Then the file "sonar-project.properties" is added to the root of the project
