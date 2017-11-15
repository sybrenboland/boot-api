
Feature: Add field class should add a given field to the api chain

  Scenario: AddField should add a basic field to the chain
    Given a boot-api project structure
    When the AddBeanClass is run
    When the AddDomainClass is run
    When the AddConverter is run
    When the AddResource is run
    When the AddService is run
    When the AddRepository is run
    When the AddSearchCriteria is run
    When the AddField is run for type String
    Then the changelog is extended with the field
    Then the method street is added to db/hibernate/bean/Adres in the Persistence module
    Then the method street is added to domain/JsonAdres in the Domain module
    Then the method Street is added to convert/AdresConverter in the Api module
    Then the method street is added to domain/JsonAdresSearchCriteria in the Domain module
    Then the method street is added to convert/SearchCriteriaConverter in the Api module
    Then the method street is added to db/repo/AdresRepositoryImpl in the Persistence module

  Scenario: AddField should add a date field to the chain
    Given a boot-api project structure
    When the AddBeanClass is run
    When the AddDomainClass is run
    When the AddConverter is run
    When the AddResource is run
    When the AddService is run
    When the AddRepository is run
    When the AddSearchCriteria is run
    When the AddField is run for type LocalDateTime
    Then the changelog is extended with the field
    Then the method street is added to db/hibernate/bean/Adres in the Persistence module
    Then the method LocalDateTimeAttributeConverter is added to db/hibernate/bean/Adres in the Persistence module
    Then the method street is added to domain/JsonAdres in the Domain module
    Then the method CustomDateTimeSerializer is added to domain/JsonAdres in the Domain module
    Then the method CustomDateTimeDeserializer is added to domain/JsonAdres in the Domain module
    Then the method Street is added to convert/AdresConverter in the Api module
    Then the converter is extended with the field
