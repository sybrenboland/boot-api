
Feature: Add One-Many relation should add a relation between two beans

  Scenario: Add One-Many relation should add a relation with no output of either class
    Given a boot-api project structure
    When the AddBeanClass is run with className Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Car
    When the AddDomainClass is run with className Car
    When the AddConverter is run with className Car
    When the AddResource is run with className Car
    When the AddService is run with className Car
    When the AddRepository is run with className Car
    When the AddSearchCriteria is run with className Car

    When the AddOneToManyRelation is run with one Person absent in output with many Car absent in output bi-directional

    Then the combination changelog is extended with FK_PERSON_CAR of class Person and class Car
    Then the name carList is added to class Person in package db.hibernate.bean of the Persistence module
    Then the name person is added to class Car in package db.hibernate.bean of the Persistence module
    Then the name cars is not added to class PersonConverter in package convert of the Api module
    Then the name persons is not added to class CarConverter in package convert of the Api module

  Scenario: Add One-Many relation should add a relation with output of both classes
    Given a boot-api project structure
    When the AddBeanClass is run with className Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Car
    When the AddDomainClass is run with className Car
    When the AddConverter is run with className Car
    When the AddResource is run with className Car
    When the AddService is run with className Car
    When the AddRepository is run with className Car
    When the AddSearchCriteria is run with className Car

    When the AddOneToManyRelation is run with one Person showing in output with many Car showing in output uni-directional

    Then the combination changelog is extended with FK_PERSON_CAR of class Person and class Car
    Then the name carList is not added to class Person in package db.hibernate.bean of the Persistence module
    Then the name person is added to class Car in package db.hibernate.bean of the Persistence module
    Then the name cars is added to class PersonConverter in package convert of the Api module
    Then the name persons is added to class CarConverter in package convert of the Api module

  Scenario: Add One-Many relation should add a relation with output of only the one side class
    Given a boot-api project structure
    When the AddBeanClass is run with className Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Car
    When the AddDomainClass is run with className Car
    When the AddConverter is run with className Car
    When the AddResource is run with className Car
    When the AddService is run with className Car
    When the AddRepository is run with className Car
    When the AddSearchCriteria is run with className Car

    When the AddOneToManyRelation is run with one Person showing in output with many Car absent in output bi-directional

    Then the combination changelog is extended with FK_PERSON_CAR of class Person and class Car
    Then the name carList is added to class Person in package db.hibernate.bean of the Persistence module
    Then the name person is added to class Car in package db.hibernate.bean of the Persistence module
    Then the name cars is added to class PersonConverter in package convert of the Api module
    Then the name persons is not added to class CarConverter in package convert of the Api module

  Scenario: Add One-Many relation should add a relation with output of only the many side class
    Given a boot-api project structure
    When the AddBeanClass is run with className Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Car
    When the AddDomainClass is run with className Car
    When the AddConverter is run with className Car
    When the AddResource is run with className Car
    When the AddService is run with className Car
    When the AddRepository is run with className Car
    When the AddSearchCriteria is run with className Car

    When the AddOneToManyRelation is run with one Person absent in output with many Car showing in output uni-directional

    Then the combination changelog is extended with FK_PERSON_CAR of class Person and class Car
    Then the name carList is not added to class Person in package db.hibernate.bean of the Persistence module
    Then the name person is added to class Car in package db.hibernate.bean of the Persistence module
    Then the name cars is not added to class PersonConverter in package convert of the Api module
    Then the name persons is added to class CarConverter in package convert of the Api module