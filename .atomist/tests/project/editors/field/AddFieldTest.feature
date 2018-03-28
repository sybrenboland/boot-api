
Feature: Add field class should add a given field to the api chain

  Scenario: AddField should add a basic field to the chain
    When the NewMavenProject is run
    When the AddBeanClass is run with className Adres
    When the AddDomainClass is run with className Adres
    When the AddConverter is run with className Adres
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddRepository is run with className Adres
    When the AddSearchCriteria is run with className Adres
    When the AddField is run for class Adres with field street with type String
    Then the changelog is extended with street of class Adres
    Then the name street is added to class Adres in package db.hibernate.bean of the Persistence module
    Then the name street is added to class JsonAdres in package domain of the Domain module
    Then the name Street is added to class AdresConverter in package convert of the Api module
    Then the name street is added to class JsonAdresSearchCriteria in package domain of the Domain module
    Then the name street is added to class AdresSearchCriteriaConverter in package convert of the Api module
    Then the name street is added to class AdresRepositoryImpl in package db.repo of the Persistence module

  Scenario: AddField should add a date field to the chain
    When the NewMavenProject is run
    When the AddBeanClass is run with className Adres
    When the AddDomainClass is run with className Adres
    When the AddConverter is run with className Adres
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddRepository is run with className Adres
    When the AddSearchCriteria is run with className Adres
    When the AddField is run for class Adres with field createdDate with type LocalDateTime
    Then the changelog is extended with createdDate of class Adres
    Then the name createdDate is added to class Adres in package db.hibernate.bean of the Persistence module
    Then the name LocalDateTimeAttributeConverter is added to class Adres in package db.hibernate.bean of the Persistence module
    Then the name createdDate is added to class JsonAdres in package domain of the Domain module
    Then the name CustomDateTimeSerializer is added to class JsonAdres in package domain of the Domain module
    Then the name CustomDateTimeDeserializer is added to class JsonAdres in package domain of the Domain module
    Then the name CreatedDate is added to class AdresConverter in package convert of the Api module
    Then a DateParam class is added to the Domain module
    Then the converter is extended with the field

  Scenario: AddField should abort if the type is not supported
    Given a boot-api project structure
    When the AddBeanClass is run with className Adres
    When the AddDomainClass is run with className Adres
    When the AddConverter is run with className Adres
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddRepository is run with className Adres
    When the AddSearchCriteria is run with className Adres
    When the AddField is run for class Adres with field createdDate with type JavaDate
    Then the name createdDate is not added to class Adres in package db.hibernate.bean of the Persistence module
    Then the name LocalDateTimeAttributeConverter is not added to class Adres in package db.hibernate.bean of the Persistence module
    Then the name createdDate is not added to class JsonAdres in package domain of the Domain module
    Then the name CustomDateTimeSerializer is not added to class JsonAdres in package domain of the Domain module
    Then the name CustomDateTimeDeserializer is not added to class JsonAdres in package domain of the Domain module
    Then the name CreatedDate is not added to class AdresConverter in package convert of the Api module
