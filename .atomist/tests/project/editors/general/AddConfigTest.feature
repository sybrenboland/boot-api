
Feature: Add config class should add configuration files to modules

  Scenario: AddConfig should add config files
    When the NewMavenProject is run
    When the AddConfig is run
    Then new dependency to pom: spring-cloud-starter-config
    Then a Persistence configuration file has been added to Persistence module
    Then a Domain configuration file has been added to Domain module
    Then a Api configuration file has been added to Api module
    Then a Core configuration file has been added to Core module
    Then the Api configuration file imports the Core configuration
    Then the Api configuration file imports the Domain configuration
    Then the Core configuration file imports the Persistence configuration
