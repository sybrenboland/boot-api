
Feature: Add search criteria should add GET with search criteria to the api chain

  Scenario: AddSearchCriteria should add GET with search criteria
    When the NewMavenProject is run
    When the AddBeanClass is run with className Adres
    When the AddResource is run with className Adres
    When the AddService is run with className Adres
    When the AddRepository is run with className Adres
    When the AddIntegrationTestSetup is run for class Adres
    When the AddSearchCriteria is run with className Adres
    Then new dependency to pom: jaxrs-api
    Then new dependency to Domain module pom: jaxrs-api
    Then new dependency to Api module pom: lombok
    Then a JsonSearchResult is added to Domain module in package domain.entities
    Then a JsonAdresSearchCriteria is added to Domain module in package domain.entities
    Then a AdresSearchCriteria is added to Persistence module in package persistence.criteria
    Then a AdresSearchCriteriaConverter is added to Api module in package api.convert
    Then the name list is added to class IAdresController in package api.resource of the Api module
    Then the name list is added to class AdresController in package api.resource of the Api module
    Then the name findBySearchCriteria is added to class AdresService in package core.service of the Core module
    Then the name findNumberOf is added to class AdresService in package core.service of the Core module
    Then a ConvertException is added to Api module in package api.convert
    Then a AdresRepositoryCustom is added to Persistence module in package persistence.db.repo
    Then a AdresRepositoryImpl is added to Persistence module in package persistence.db.repo
    Then a AbstractHibernateRepository is added to Persistence module in package persistence.db.repo
