
Feature: Add field class should add a given field to the api chain

  Scenario: AddField should add a basic field to the chain
    Given a boot-api project structure
    When the AddBeanClass is run
    When the AddDomainClass is run
    When the AddConverter is run
    When the AddField is run for type String
    Then the changelog is extended with the field
    Then the bean is extended with the field
    Then the domain class is extended with the field
    Then the converter is extended with the field

  Scenario: AddField should add a date field to the chain
    Given a boot-api project structure
    When the AddBeanClass is run
    When the AddDomainClass is run
    When the AddConverter is run
    When the AddField is run for type LocalDateTime
    Then the changelog is extended with the field
    Then the bean is extended with the field
    Then a LocalDateTimeAttributeConverter annotation was added on the bean field
    Then the domain class is extended with the field
    Then a CustomDateTimeSerializer annotation was added on the domain field
    Then a CustomDateTimeDeserializer annotation was added on the domain field
    Then the converter is extended with the field
