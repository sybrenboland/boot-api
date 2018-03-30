
Feature: Add Docker should everything to run the api as docker container

  Scenario: AddDocker should add docker file and config
    When the NewMavenProject is run
    When the AddSpringBoot is run
    When the AddLiquibase is run
    When the AddDocker is run
    Then a dockerfile is added to the Api module
    Then new property to pom: docker.image.prefix
    Then new property to pom: docker.plugin.version
    Then new plugin to Api module pom: spring-boot-maven-plugin
    Then new plugin to Api module pom: docker-maven-plugin
    Then the docker compose file contains the new service
