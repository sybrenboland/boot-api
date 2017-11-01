
Feature: Add repository class to persistence module

  Scenario: AddRepository should add a repository class to the persistence module
    Given a boot-api project structure
    When the AddRepository is run
    Then new dependency to pom: spring-boot-starter-data-jpa
    Then a repository class is added to the Persistence module
