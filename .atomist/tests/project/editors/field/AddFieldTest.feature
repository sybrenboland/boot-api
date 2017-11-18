
Feature: Add field class should add a given field to the api chain

  Scenario: AddField should add a basic field to the chain
    Given a boot-api project structure
    When the AddBeanClass is run with className Adres
    When the AddDomainClass is run with className Adres
    When the AddConverter is run with className Adres
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddRepository is run with className Adres
    When the AddSearchCriteria is run with className Adres
    When the AddField is run for class Adres with field street with type String
    Then the changelog is extended with the field
    Then the method street is added to db/hibernate/bean/Adres in the Persistence module
    Then the method street is added to domain/JsonAdres in the Domain module
    Then the method Street is added to convert/AdresConverter in the Api module
    Then the method street is added to domain/JsonAdresSearchCriteria in the Domain module
    Then the method street is added to convert/AdresSearchCriteriaConverter in the Api module
    Then the method street is added to db/repo/AdresRepositoryImpl in the Persistence module

  Scenario: AddField should add a date field to the chain
    Given a boot-api project structure
    When the AddBeanClass is run with className Adres
    When the AddDomainClass is run with className Adres
    When the AddConverter is run with className Adres
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddRepository is run with className Adres
    When the AddSearchCriteria is run with className Adres
    When the AddField is run for class Adres with field createdDate with type LocalDateTime
    Then the changelog is extended with the field
    Then the method createdDate is added to db/hibernate/bean/Adres in the Persistence module
    Then the method LocalDateTimeAttributeConverter is added to db/hibernate/bean/Adres in the Persistence module
    Then the method createdDate is added to domain/JsonAdres in the Domain module
    Then the method CustomDateTimeSerializer is added to domain/JsonAdres in the Domain module
    Then the method CustomDateTimeDeserializer is added to domain/JsonAdres in the Domain module
    Then the method CreatedDate is added to convert/AdresConverter in the Api module
    Then a DateParam class is added to the Domain module
    Then the converter is extended with the field
