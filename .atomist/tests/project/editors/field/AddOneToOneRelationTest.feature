
Feature: Add One-One relation should add a relation between two beans

  Scenario: Add One-One relation should add a relation with no output of either class
    When the NewMavenProject is run
    When the AddBeanClass is run with className Person
    When the AddIntegrationTestSetup is run for class Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Detail
    When the AddIntegrationTestSetup is run for class Detail
    When the AddDomainClass is run with className Detail
    When the AddConverter is run with className Detail
    When the AddResource is run with className Detail
    When the AddService is run with className Detail
    When the AddRepository is run with className Detail
    When the AddSearchCriteria is run with className Detail

    When the AddOneToOneRelation is run with one Person absent in output with many Detail absent in output bi-directional, with PUT,DELETE as methods on the mapping side and PUT,DELETE as methods on the other side

    Then the combination changelog is extended with FK_PERSON_DETAIL
    Then the name detail is added to class Person in package persistence.db.hibernate.bean of the Persistence module
    Then the name person is added to class Detail in package persistence.db.hibernate.bean of the Persistence module
    Then the name detail is not added to class PersonConverter in package api.convert of the Api module
    Then the name person is not added to class DetailConverter in package api.convert of the Api module

    Then the name putPersonWithDetail is added to class IDetailController in package api.resource of the Api module
    Then the name putPersonWithDetail is added to class DetailController in package api.resource of the Api module
    Then the name updateDetailWithPerson is added to class DetailService in package core.service of the Core module

    Then the name putDetailWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name putDetailWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name updatePersonWithDetail is added to class PersonService in package core.service of the Core module

    Then the name deletePersonWithDetail is added to class IDetailController in package api.resource of the Api module
    Then the name deletePersonWithDetail is added to class DetailController in package api.resource of the Api module
    Then the name removePerson is added to class DetailService in package core.service of the Core module

    Then the name deleteDetailWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name deleteDetailWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name removeDetail is added to class PersonService in package core.service of the Core module

  Scenario: Add One-One relation should add a relation with output of both classes
    When the NewMavenProject is run
    When the AddBeanClass is run with className Person
    When the AddIntegrationTestSetup is run for class Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Detail
    When the AddIntegrationTestSetup is run for class Detail
    When the AddDomainClass is run with className Detail
    When the AddConverter is run with className Detail
    When the AddResource is run with className Detail
    When the AddService is run with className Detail
    When the AddRepository is run with className Detail
    When the AddSearchCriteria is run with className Detail

    When the AddOneToOneRelation is run with one Person showing in output with many Detail showing in output uni-directional, with PUT,DELETE as methods on the mapping side and PUT,DELETE as methods on the other side

    Then the combination changelog is extended with FK_PERSON_DETAIL
    Then the name detail is not added to class Person in package persistence.db.hibernate.bean of the Persistence module
    Then the name person is added to class Detail in package persistence.db.hibernate.bean of the Persistence module
    Then the name detail is added to class PersonConverter in package api.convert of the Api module
    Then the name person is added to class DetailConverter in package api.convert of the Api module

    Then the name putPersonWithDetail is added to class IDetailController in package api.resource of the Api module
    Then the name putPersonWithDetail is added to class DetailController in package api.resource of the Api module
    Then the name updateDetailWithPerson is added to class DetailService in package core.service of the Core module

    Then the name putDetailWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name putDetailWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name updatePersonWithDetail is added to class PersonService in package core.service of the Core module

    Then the name deletePersonWithDetail is not added to class IDetailController in package api.resource of the Api module
    Then the name deletePersonWithDetail is not added to class DetailController in package api.resource of the Api module
    Then the name removePerson is not added to class DetailService in package core.service of the Core module

    Then the name deleteDetailWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name deleteDetailWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name removeDetail is not added to class PersonService in package core.service of the Core module

  Scenario: Add One-One relation should add a relation with output of only the one side class
    When the NewMavenProject is run
    When the AddBeanClass is run with className Person
    When the AddIntegrationTestSetup is run for class Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Detail
    When the AddIntegrationTestSetup is run for class Detail
    When the AddDomainClass is run with className Detail
    When the AddConverter is run with className Detail
    When the AddResource is run with className Detail
    When the AddService is run with className Detail
    When the AddRepository is run with className Detail
    When the AddSearchCriteria is run with className Detail

    When the AddOneToOneRelation is run with one Person showing in output with many Detail absent in output bi-directional, with nothing as methods on the mapping side and DELETE as methods on the other side

    Then the combination changelog is extended with FK_PERSON_DETAIL
    Then the name detail is added to class Person in package persistence.db.hibernate.bean of the Persistence module
    Then the name person is added to class Detail in package persistence.db.hibernate.bean of the Persistence module
    Then the name detail is added to class PersonConverter in package api.convert of the Api module
    Then the name person is not added to class DetailConverter in package api.convert of the Api module

    Then the name putPersonWithDetail is not added to class IDetailController in package api.resource of the Api module
    Then the name putPersonWithDetail is not added to class DetailController in package api.resource of the Api module
    Then the name updateDetailWithPerson is not added to class DetailService in package core.service of the Core module

    Then the name putDetailWithPerson is not added to class IPersonController in package api.resource of the Api module
    Then the name putDetailWithPerson is not added to class PersonController in package api.resource of the Api module
    Then the name updatePersonWithDetail is not added to class PersonService in package core.service of the Core module

    Then the name deletePersonWithDetail is added to class IDetailController in package api.resource of the Api module
    Then the name deletePersonWithDetail is added to class DetailController in package api.resource of the Api module
    Then the name removePerson is added to class DetailService in package core.service of the Core module

    Then the name deleteDetailWithPerson is not added to class IPersonController in package api.resource of the Api module
    Then the name deleteDetailWithPerson is not added to class PersonController in package api.resource of the Api module
    Then the name removeDetail is not added to class PersonService in package core.service of the Core module

  Scenario: Add One-One relation should add a relation with output of only the many side class
    When the NewMavenProject is run
    When the AddBeanClass is run with className Person
    When the AddIntegrationTestSetup is run for class Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Detail
    When the AddIntegrationTestSetup is run for class Detail
    When the AddDomainClass is run with className Detail
    When the AddConverter is run with className Detail
    When the AddResource is run with className Detail
    When the AddService is run with className Detail
    When the AddRepository is run with className Detail
    When the AddSearchCriteria is run with className Detail

    When the AddOneToOneRelation is run with one Person absent in output with many Detail showing in output uni-directional, with PUT as methods on the mapping side and nothing as methods on the other side

    Then the combination changelog is extended with FK_PERSON_DETAIL
    Then the name detail is not added to class Person in package persistence.db.hibernate.bean of the Persistence module
    Then the name person is added to class Detail in package persistence.db.hibernate.bean of the Persistence module
    Then the name detail is not added to class PersonConverter in package api.convert of the Api module
    Then the name person is added to class DetailConverter in package api.convert of the Api module

    Then the name putPersonWithDetail is not added to class IDetailController in package api.resource of the Api module
    Then the name putPersonWithDetail is not added to class DetailController in package api.resource of the Api module
    Then the name updateDetailWithPerson is not added to class DetailService in package core.service of the Core module

    Then the name putDetailWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name putDetailWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name updatePersonWithDetail is added to class PersonService in package core.service of the Core module

    Then the name deletePersonWithDetail is not added to class IDetailController in package api.resource of the Api module
    Then the name deletePersonWithDetail is not added to class DetailController in package api.resource of the Api module
    Then the name removePerson is not added to class DetailService in package core.service of the Core module

    Then the name deleteDetailWithPerson is not added to class IPersonController in package api.resource of the Api module
    Then the name deleteDetailWithPerson is not added to class PersonController in package api.resource of the Api module
    Then the name removeDetail is not added to class PersonService in package core.service of the Core module
