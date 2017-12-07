
Feature: Package as War makes the spring boot application runnable on an application server

  Scenario: PackageAsWar should package the api module as war file
    Given a boot-api project structure
    When the AddSpringBoot is run
    When the AddConfig is run
    When the AddActuator is run
    Then new dependency to pom: spring-boot-starter-actuator
    Then the name management is added to configuration file bootstrap of module Api
