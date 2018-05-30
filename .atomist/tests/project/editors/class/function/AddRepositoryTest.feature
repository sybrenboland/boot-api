
Feature: Add repository class to persistence module

  Scenario: AddRepository should add a repository class to the persistence module
    When the NewMavenProject is run
    When the AddRepository is run with className "Adres"
    Then new dependency to pom: "spring-boot-starter-data-jpa"
    Then a repository class is added
