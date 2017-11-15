
Feature: Add search criteria should add GET with search criteria to the api chain

  Scenario: AddSearchCriteria should add GET with search criteria
    Given a boot-api project structure
    When the AddBeanClass is run
    When the AddResource is run
    When the AddService is run
    When the AddRepository is run
    When the AddSearchCriteria is run
    Then new dependency to pom: jaxrs-api
    Then new dependency to Domain module pom: jaxrs-api
    Then new dependency to Api module pom: lombok
    Then a JsonSearchResult is added to Domain module in package domain
    Then a JsonAdresSearchCriteria is added to Domain module in package domain
    Then a AdresSearchCriteria is added to Persistence module in package domain
    Then a SearchCriteriaConverter is added to Api module in package convert
    Then the method list is added to resource/IAdresController in the Api module
    Then the method list is added to resource/AdresController in the Api module
    Then the method findBySearchCriteria is added to service/AdresService in the Api module
    Then the method findNumberOf is added to service/AdresService in the Api module
    Then a ConvertException is added to Api module in package convert
    Then a AdresRepositoryCustom is added to Persistence module in package db.repo
    Then a AdresRepositoryImpl is added to Persistence module in package db.repo
    Then a AbstractHibernateRepository is added to Persistence module in package db.repo
