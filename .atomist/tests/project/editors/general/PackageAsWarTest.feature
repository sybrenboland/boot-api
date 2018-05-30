
Feature: Package as War makes the spring boot application runnable on an application server

  Scenario: PackageAsWar should package the api module as war file
    When the NewMavenProject is run
    When the AddSpringBoot is run
    When the PackageAsWar is run
    Then new dependency to pom: "spring-boot-starter-tomcat"
    Then new dependency to "Api" module pom: "war"
    Then the name "SpringBootServletInitializer" is added to "Application" class of the "Api" module
    Then the README contains info about "wildfly"
