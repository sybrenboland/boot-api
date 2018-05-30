
Feature: Add bean class should add hibernate bean to project

  Scenario: AddBeanClass should add a bean
    When the NewMavenProject is run
    When the AddBeanClass is run with className "Adres"
    Then new dependency to pom: "spring-boot-starter-data-jpa"
    Then the project has new bean
    Then the bean has the given name
    Then a changelog has been added
