
Feature: Add search criteria should add GET with search criteria to the api chain

  Scenario: AddSearchCriteria should add GET with search criteria
    Given a boot-api project structure
    When the AddBeanClass is run with className Adres
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddRepository is run with className Adres
    When the AddSearchCriteria is run with className Adres
    Then new dependency to pom: jaxrs-api
    Then new dependency to Domain module pom: jaxrs-api
    Then new dependency to Api module pom: lombok
    Then a JsonSearchResult is added to Domain module in package domain
    Then a JsonAdresSearchCriteria is added to Domain module in package domain
    Then a AdresSearchCriteria is added to Persistence module in package domain
    Then a AdresSearchCriteriaConverter is added to Api module in package convert
    Then the name list is added to class IAdresController in package resource of the Api module
    Then the name list is added to class AdresController in package resource of the Api module
    Then the name findBySearchCriteria is added to class AdresService in package service of the Api module
    Then the name findNumberOf is added to class AdresService in package service of the Api module
    Then a ConvertException is added to Api module in package convert
    Then a AdresRepositoryCustom is added to Persistence module in package db.repo
    Then a AdresRepositoryImpl is added to Persistence module in package db.repo
    Then a AbstractHibernateRepository is added to Persistence module in package db.repo
