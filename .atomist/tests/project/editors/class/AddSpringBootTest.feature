
Feature: Add application class with its dependencies

  Scenario: AddSpringBoot should add a application class with its dependencies
    Given a boot-api project structure
    When the AddSpringBoot is run
    Then the parent of the master pom is spring boot
    Then new dependency to pom: spring-boot-starter-web
    Then an application class is added to the Api module
