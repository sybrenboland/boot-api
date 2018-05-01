
Feature: Adds methods to all layers implementing REST get method

  Scenario: AddGET should add an implementation of the REST get method
    When the NewMavenProject is run
    When the AddSpringBoot is run
    When the AddBeanClass is run with className Adres
    When the AddRepository is run with className Adres
    When the AddIntegrationTestSetup is run for class Adres
    Then new dependency to pom: spring-boot-starter-test
    Then new dependency to pom: h2
    Then new dependency to pom: jackson-mapper-asl
    Then new dependency to Api module pom: h2
    Then new dependency to Api module pom: jackson-mapper-asl
    Then the bean Adres has an integration test file
    Then a integration test util file has been added
