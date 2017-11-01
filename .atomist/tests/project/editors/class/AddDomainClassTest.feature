
Feature: Add domain class should add a domain object class to the domain module

  Scenario: AddDomainClass should add a domain object class
    Given a boot-api project structure
    When the AddDomainClass is run
    Then new dependency to pom: jackson-annotations
    Then new dependency to Domain module pom: jackson-annotations
    Then a domain class is added to the Domain module
