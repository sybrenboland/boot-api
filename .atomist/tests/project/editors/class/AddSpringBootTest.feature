
Feature: Add application class with its dependencies

  Scenario: AddSpringBoot should add a application class with its dependencies
    When the NewMavenProject is run
    When the AddSpringBoot is run
    Then the parent of the master pom is spring boot
    Then new dependency to pom: spring-boot-starter-web
    Then an application class is added to the Api module
