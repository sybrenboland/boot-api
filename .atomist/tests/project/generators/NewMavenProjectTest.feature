
Feature: Generate new maven project with separate modules

  Scenario: NewMavenProject should generate a new maven project
    When the NewMavenProject is run
    Then new dependency to pom: "spring-boot-starter-parent"
    Then the master pom has the given artifactId
    Then the master pom has the given groupId
    Then the master pom has the given version
