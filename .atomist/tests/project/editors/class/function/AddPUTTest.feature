
Feature: Adds methods to all layers implementing REST put method

  Scenario: AddPUT should add an implementation of the REST put method
    When the NewMavenProject is run
    When the AddResource is run with className "Adres"
    When the AddService is run with className "Adres"
    When the AddIntegrationTestSetup is run for class "Adres"
    When the AddPUT is run with className "Adres"
    Then new dependency to pom: "spring-boot-starter-web"
    Then the name "putAdres" is added to class "IAdresController" in package "api.resource" of the "Api" module
    Then the name "putAdres" is added to class "AdresController" in package "api.resource" of the "Api" module
    Then the name "save" is added to class "AdresService" in package "core.service" of the "Core" module
    Then the test "testPutAdres_invalidObject" is added to the integration tests of class "Adres"
