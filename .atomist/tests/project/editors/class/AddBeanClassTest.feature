
Feature: Add bean class should add hibernate bean to project

  Scenario: AddBeanClass should add a bean
    Given a boot-api project structure
    When the AddBeanClass is run
    Then new dependency to pom: spring-boot-starter-data-jpa
    Then the project has new bean
    Then the bean has the given name
    Then a changelog has been added
    Then the changelog has the right name
