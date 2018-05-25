
Feature: Add Many-Many relation should add a relation between two beans

  Scenario: Add Many-Many relation should add a relation with no output of either class
    When the NewMavenProject is run
    When the AddBeanClass is run with className Person
    When the AddIntegrationTestSetup is run for class Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Car
    When the AddIntegrationTestSetup is run for class Car
    When the AddDomainClass is run with className Car
    When the AddConverter is run with className Car
    When the AddResource is run with className Car
    When the AddService is run with className Car
    When the AddRepository is run with className Car
    When the AddSearchCriteria is run with className Car

    When the AddManyToManyRelation is run with one Person absent in output with many Car absent in output bi-directional, with PUT,DELETE as methods on the mapping side and PUT,DELETE as methods on the other side

    Then the combination changelog is extended with FK_CAR_PERSON_CAR
    Then the combination changelog is extended with FK_PERSON_PERSON_CAR
    Then the name carSet is added to class Person in package persistence.db.hibernate.bean of the Persistence module
    Then the name personSet is added to class Car in package persistence.db.hibernate.bean of the Persistence module

    Then the name putPersonWithCar is added to class ICarController in package api.resource of the Api module
    Then the name putPersonWithCar is added to class CarController in package api.resource of the Api module
    Then the name updateCarWithPerson is added to class CarService in package core.service of the Core module

    Then the name putCarWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name putCarWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name updatePersonWithCar is added to class PersonService in package core.service of the Core module

    Then the name deletePersonWithCar is added to class ICarController in package api.resource of the Api module
    Then the name deletePersonWithCar is added to class CarController in package api.resource of the Api module
    Then the name removePerson is added to class CarService in package core.service of the Core module

    Then the name deleteCarWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name deleteCarWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name removeCar is added to class PersonService in package core.service of the Core module

  Scenario: Add Many-Many relation should add a relation with output of both classes
    When the NewMavenProject is run
    When the AddBeanClass is run with className Person
    When the AddIntegrationTestSetup is run for class Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Car
    When the AddIntegrationTestSetup is run for class Car
    When the AddDomainClass is run with className Car
    When the AddConverter is run with className Car
    When the AddResource is run with className Car
    When the AddService is run with className Car
    When the AddRepository is run with className Car
    When the AddSearchCriteria is run with className Car

    When the AddManyToManyRelation is run with one Person showing in output with many Car showing in output uni-directional, with PUT,DELETE as methods on the mapping side and PUT,DELETE as methods on the other side

    Then the combination changelog is extended with FK_CAR_PERSON_CAR
    Then the combination changelog is extended with FK_PERSON_PERSON_CAR
    Then the name carSet is not added to class Person in package persistence.db.hibernate.bean of the Persistence module
    Then the name personSet is added to class Car in package persistence.db.hibernate.bean of the Persistence module

    Then the name putPersonWithCar is added to class ICarController in package api.resource of the Api module
    Then the name putPersonWithCar is added to class CarController in package api.resource of the Api module
    Then the name updateCarWithPerson is added to class CarService in package core.service of the Core module

    Then the name putCarWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name putCarWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name updatePersonWithCar is added to class PersonService in package core.service of the Core module

    Then the name deletePersonWithCar is added to class ICarController in package api.resource of the Api module
    Then the name deletePersonWithCar is added to class CarController in package api.resource of the Api module
    Then the name removePerson is added to class CarService in package core.service of the Core module

    Then the name deleteCarWithPerson is not added to class IPersonController in package api.resource of the Api module
    Then the name deleteCarWithPerson is not added to class PersonController in package api.resource of the Api module
    Then the name removeCar is not added to class PersonService in package core.service of the Core module

  Scenario: Add Many-Many relation should add a relation with output of only the one side class
    When the NewMavenProject is run
    When the AddBeanClass is run with className Person
    When the AddIntegrationTestSetup is run for class Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Car
    When the AddIntegrationTestSetup is run for class Car
    When the AddDomainClass is run with className Car
    When the AddConverter is run with className Car
    When the AddResource is run with className Car
    When the AddService is run with className Car
    When the AddRepository is run with className Car
    When the AddSearchCriteria is run with className Car

    When the AddManyToManyRelation is run with one Person showing in output with many Car absent in output bi-directional, with PUT as methods on the mapping side and nothing as methods on the other side

    Then the combination changelog is extended with FK_CAR_PERSON_CAR
    Then the combination changelog is extended with FK_PERSON_PERSON_CAR
    Then the name carSet is added to class Person in package persistence.db.hibernate.bean of the Persistence module
    Then the name personSet is added to class Car in package persistence.db.hibernate.bean of the Persistence module

    Then the name putPersonWithCar is not added to class ICarController in package api.resource of the Api module
    Then the name putPersonWithCar is not added to class CarController in package api.resource of the Api module
    Then the name updateCarWithPerson is not added to class CarService in package core.service of the Core module

    Then the name putCarWithPerson is added to class IPersonController in package api.resource of the Api module
    Then the name putCarWithPerson is added to class PersonController in package api.resource of the Api module
    Then the name updatePersonWithCar is added to class PersonService in package core.service of the Core module

    Then the name deletePersonWithCar is not added to class ICarController in package api.resource of the Api module
    Then the name deletePersonWithCar is not added to class CarController in package api.resource of the Api module
    Then the name removePerson is not added to class CarService in package core.service of the Core module

    Then the name deleteCarWithPerson is not added to class IPersonController in package api.resource of the Api module
    Then the name deleteCarWithPerson is not added to class PersonController in package api.resource of the Api module
    Then the name removeCar is not added to class PersonService in package core.service of the Core module

  Scenario: Add Many-Many relation should add a relation with output of only the many side class
    When the NewMavenProject is run
    When the AddBeanClass is run with className Person
    When the AddIntegrationTestSetup is run for class Person
    When the AddDomainClass is run with className Person
    When the AddConverter is run with className Person
    When the AddResource is run with className Person
    When the AddService is run with className Person
    When the AddRepository is run with className Person
    When the AddSearchCriteria is run with className Person

    When the AddBeanClass is run with className Car
    When the AddIntegrationTestSetup is run for class Car
    When the AddDomainClass is run with className Car
    When the AddConverter is run with className Car
    When the AddResource is run with className Car
    When the AddService is run with className Car
    When the AddRepository is run with className Car
    When the AddSearchCriteria is run with className Car

    When the AddManyToManyRelation is run with one Person absent in output with many Car showing in output uni-directional, with nothing as methods on the mapping side and DELETE as methods on the other side

    Then the combination changelog is extended with FK_CAR_PERSON_CAR
    Then the combination changelog is extended with FK_PERSON_PERSON_CAR
    Then the name carSet is not added to class Person in package persistence.db.hibernate.bean of the Persistence module
    Then the name personSet is added to class Car in package persistence.db.hibernate.bean of the Persistence module

    Then the name putPersonWithCar is not added to class ICarController in package api.resource of the Api module
    Then the name putPersonWithCar is not added to class CarController in package api.resource of the Api module
    Then the name updateCarWithPerson is not added to class CarService in package core.service of the Core module

    Then the name putCarWithPerson is not added to class IPersonController in package api.resource of the Api module
    Then the name putCarWithPerson is not added to class PersonController in package api.resource of the Api module
    Then the name updatePersonWithCar is not added to class PersonService in package core.service of the Core module

    Then the name deletePersonWithCar is added to class ICarController in package api.resource of the Api module
    Then the name deletePersonWithCar is added to class CarController in package api.resource of the Api module
    Then the name removePerson is added to class CarService in package core.service of the Core module

    Then the name deleteCarWithPerson is not added to class IPersonController in package api.resource of the Api module
    Then the name deleteCarWithPerson is not added to class PersonController in package api.resource of the Api module
    Then the name removeCar is not added to class PersonService in package core.service of the Core module
