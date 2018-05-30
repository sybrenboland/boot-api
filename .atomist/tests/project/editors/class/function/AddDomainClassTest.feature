
Feature: Add domain class should add a domain object class to the domain module

  Scenario: AddDomainClass should add a domain object class
    When the NewMavenProject is run
    When the AddDomainClass is run with className "Adres"
    Then new dependency to pom: "jackson-annotations"
    Then new dependency to "Domain" module pom: "jackson-annotations"
    Then a domain class is added
