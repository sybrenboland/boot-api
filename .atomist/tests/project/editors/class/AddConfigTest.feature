
Feature: Add config class should add configuration files to modules

  Scenario: AddConfig should add config files
    Given a boot-api project structure
    When the AddConfig is run
    Then new dependency to pom: spring-cloud-starter-config
    Then a Persistence configuration file has been added to Persistence module
    Then a Domain configuration file has been added to Domain module
    Then a Api configuration file has been added to Api module
    Then the Api configuration file imports the Persistence configuration
    Then the Api configuration file imports the Domain configuration
