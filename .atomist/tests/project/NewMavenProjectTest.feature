Feature: NewMavenProject should generate a project
  This is the sample Gherkin feature file for the BDD tests of
  the Bare minimum of a maven project. (Use the editors!).
  Feel free to modify and extend to suit the needs of your generator.


  Scenario: NewMavenProject should create a new project based on this seed
    Given an empty project
    When NewMavenProject is run
    Then the pom file exists
    Then the pom has right artifactId
