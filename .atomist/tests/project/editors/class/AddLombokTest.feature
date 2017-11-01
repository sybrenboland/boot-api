
Feature: Adds lombok annotations with imports to a java class

  Scenario: AddLombok should add lombok annotations with related imports to a java file
    Given a boot-api project structure
    When the AddBeanClass is run
    When the AddLombok is run
    Then new bean contains the import lombok.Getter
    Then new bean contains the import lombok.Setter
    Then new bean contains the import lombok.Builder
    Then new bean contains the import lombok.AccessLevel
    Then new bean contains the import lombok.NoArgsConstructor
    Then new bean contains the import lombok.AllArgsConstructor
    Then new bean contains the annotation @Getter
    Then new bean contains the annotation @Setter
    Then new bean contains the annotation @Builder
    Then new bean contains the annotation @NoArgsConstructor
    Then new bean contains the annotation @AllArgsConstructor(access = AccessLevel.PRIVATE)
