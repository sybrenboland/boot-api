
Feature: Adds configuration for using liquibase with postgres

  Scenario: AddLiquibase should add all configuration for using liquibase with postgres
    Given a boot-api project structure
    When the AddLiquibase is run
    Then new dependency to pom: liquibase-core
    Then new dependency to pom: postgresql
    Then new dependency to Api module pom: liquibase-core
    Then new dependency to Api module pom: postgresql
    Then the Api module contains liquibase properties in application.yml
    Then the Persistence module contains databaseChangeLog properties in liquibase/db-changelog.xml
    Then a docker-compose file for the database setup is added
