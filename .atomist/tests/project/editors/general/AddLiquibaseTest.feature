
Feature: Adds configuration for using liquibase with postgres

  Scenario: AddLiquibase should add all configuration for using liquibase with postgres
    When the NewMavenProject is run
    When the AddLiquibase is run
    Then new dependency to pom: "liquibase-core"
    Then new dependency to pom: "postgresql"
    Then new dependency to "Api" module pom: "liquibase-core"
    Then new dependency to "Api" module pom: "postgresql"
    Then the "Api" module contains "liquibase" properties in "application.yml"
    Then a docker-compose file for the database setup is added
