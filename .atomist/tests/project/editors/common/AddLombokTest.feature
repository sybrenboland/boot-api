
Feature: Adds lombok annotations with imports to a java class

  Scenario: AddLombok should add lombok annotations with related imports to a java file
    When the NewMavenProject is run
    When the AddBeanClass is run with className Adres
    When the AddLombok is run with className Adres
    Then new bean contains the import lombok.Getter
    Then new bean contains the import lombok.Builder
    Then new bean contains the import lombok.NoArgsConstructor
    Then new bean contains the annotation @Getter
    Then new bean contains the annotation @Builder
    Then new bean contains the annotation @NoArgsConstructor
