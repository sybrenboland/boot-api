
Feature: Add Actuator should add actuator functionality

  Scenario: AddActuator should add actuator dependency
    When the NewMavenProject is run
    When the AddSpringBoot is run
    When the AddConfig is run
    When the AddActuator is run
    Then new dependency to pom: spring-boot-starter-actuator
    Then the name management is added to configuration file bootstrap of module Api
