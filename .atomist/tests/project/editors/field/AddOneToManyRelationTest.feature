
Feature: Add One-Many relation should add a relation between two beans

  Scenario: Add One-Many relation should add a relation with no output of either class
    When the NewMavenProject is run
    When the AddBeanClass is run with className "Person"
    When the AddIntegrationTestSetup is run for class "Person"
    When the AddDomainClass is run with className "Person"
    When the AddConverter is run with className "Person"
    When the AddResource is run with className "Person"
    When the AddService is run with className "Person"
    When the AddRepository is run with className "Person"
    When the AddSearchCriteria is run with className "Person"

    When the AddBeanClass is run with className "Car"
    When the AddIntegrationTestSetup is run for class "Car"
    When the AddDomainClass is run with className "Car"
    When the AddConverter is run with className "Car"
    When the AddResource is run with className "Car"
    When the AddService is run with className "Car"
    When the AddRepository is run with className "Car"
    When the AddSearchCriteria is run with className "Car"

    When the AddOneToManyRelation is run with one "Person" absent in output with many "Car" absent in output bi-directional, with "PUT,DELETE" as methods on the one side and "PUT,DELETE" as methods on the many side

    Then the combination changelog is extended with "FK_PERSON_CAR"
    Then the name "carSet" is added to class "Person" in package "persistence.db.hibernate.bean" of the "Persistence" module
    Then the name "person" is added to class "Car" in package "persistence.db.hibernate.bean" of the "Persistence" module
    Then the name "cars" is not added to class "PersonConverter" in package "api.convert" of the "Api" module
    Then the name "persons" is not added to class "CarConverter" in package "api.convert" of the "Api" module

    Then the name "putPersonWithCar" is added to class "ICarController" in package "api.resource" of the "Api" module
    Then the name "putPersonWithCar" is added to class "CarController" in package "api.resource" of the "Api" module
    Then the unit test for "putPersonWithCar" is added for the class "CarController" in the package "api.resource" of the "Api" module
    Then the name "updateCarWithPerson" is added to class "CarService" in package "core.service" of the "Core" module
    Then the unit test for "updateCarWithPerson" is added for the class "CarService" in the package "core.service" of the "Core" module
    Then the test "testPutCar_withPersonWithCar" is added to the integration tests of class "Person"

    Then the name "putCarWithPerson" is added to class "IPersonController" in package "api.resource" of the "Api" module
    Then the name "putCarWithPerson" is added to class "PersonController" in package "api.resource" of the "Api" module
    Then the unit test for "putCarWithPerson" is added for the class "PersonController" in the package "api.resource" of the "Api" module
    Then the name "updatePersonWithCar" is added to class "PersonService" in package "core.service" of the "Core" module
    Then the unit test for "updatePersonWithCar" is added for the class "PersonService" in the package "core.service" of the "Core" module
    Then the test "testPutPerson_withCarNoPerson" is added to the integration tests of class "Car"

    Then the name "deletePersonWithCar" is added to class "ICarController" in package "api.resource" of the "Api" module
    Then the name "deletePersonWithCar" is added to class "CarController" in package "api.resource" of the "Api" module
    Then the unit test for "deletePersonWithCar" is added for the class "CarController" in the package "api.resource" of the "Api" module
    Then the name "removePerson" is added to class "CarService" in package "core.service" of the "Core" module
    Then the unit test for "removePerson" is added for the class "CarService" in the package "core.service" of the "Core" module
    Then the test "testDeleteCar_withPerson" is added to the integration tests of class "Person"

    Then the name "deleteCarWithPerson" is added to class "IPersonController" in package "api.resource" of the "Api" module
    Then the name "deleteCarWithPerson" is added to class "PersonController" in package "api.resource" of the "Api" module
    Then the unit test for "deleteCarWithPerson" is added for the class "PersonController" in the package "api.resource" of the "Api" module
    Then the name "removeCar" is added to class "PersonService" in package "core.service" of the "Core" module
    Then the unit test for "removeCar" is added for the class "PersonService" in the package "core.service" of the "Core" module
    Then the test "testDeletePerson_withCarNoPerson" is added to the integration tests of class "Car"

  Scenario: Add One-Many relation should add a relation with output of both classes
    When the NewMavenProject is run
    When the AddBeanClass is run with className "Person"
    When the AddIntegrationTestSetup is run for class "Person"
    When the AddDomainClass is run with className "Person"
    When the AddConverter is run with className "Person"
    When the AddResource is run with className "Person"
    When the AddService is run with className "Person"
    When the AddRepository is run with className "Person"
    When the AddSearchCriteria is run with className "Person"

    When the AddBeanClass is run with className "Car"
    When the AddIntegrationTestSetup is run for class "Car"
    When the AddDomainClass is run with className "Car"
    When the AddConverter is run with className "Car"
    When the AddResource is run with className "Car"
    When the AddService is run with className "Car"
    When the AddRepository is run with className "Car"
    When the AddSearchCriteria is run with className "Car"

    When the AddOneToManyRelation is run with one "Person" showing in output with many "Car" showing in output uni-directional, with "PUT,DELETE" as methods on the one side and "PUT,DELETE" as methods on the many side

    Then the combination changelog is extended with "FK_PERSON_CAR"
    Then the name "carSet" is not added to class "Person" in package "persistence.db.hibernate.bean" of the "Persistence" module
    Then the name "person" is added to class "Car" in package "persistence.db.hibernate.bean" of the "Persistence" module
    Then the name "cars" is added to class "PersonConverter" in package "api.convert" of the "Api" module
    Then the name "persons" is added to class "CarConverter" in package "api.convert" of the "Api" module

    Then the name "putPersonWithCar" is added to class "ICarController" in package "api.resource" of the "Api" module
    Then the name "putPersonWithCar" is added to class "CarController" in package "api.resource" of the "Api" module
    Then the unit test for "putPersonWithCar" is added for the class "CarController" in the package "api.resource" of the "Api" module
    Then the name "updateCarWithPerson" is added to class "CarService" in package "core.service" of the "Core" module
    Then the unit test for "updateCarWithPerson" is added for the class "CarService" in the package "core.service" of the "Core" module
    Then the test "testPutPerson_withCarNoPerson" is added to the integration tests of class "Car"

    Then the name "putCarWithPerson" is not added to class "IPersonController" in package "api.resource" of the "Api" module
    Then the name "putCarWithPerson" is not added to class "PersonController" in package "api.resource" of the "Api" module
    Then the unit test for "putCarWithPerson" is not added for the class "PersonController" in the package "api.resource" of the "Api" module
    Then the name "updatePersonWithCar" is not added to class "PersonService" in package "core.service" of the "Core" module
    Then the unit test for "updatePersonWithCar" is not added for the class "PersonService" in the package "core.service" of the "Core" module
    Then the test "testPutCar_withPersonWithCar" is not added to the integration tests of class "Person"

    Then the name "deletePersonWithCar" is added to class "ICarController" in package "api.resource" of the "Api" module
    Then the name "deletePersonWithCar" is added to class "CarController" in package "api.resource" of the "Api" module
    Then the unit test for "deletePersonWithCar" is added for the class "CarController" in the package "api.resource" of the "Api" module
    Then the name "removePerson" is added to class "CarService" in package "core.service" of the "Core" module
    Then the unit test for "removePerson" is added for the class "CarService" in the package "core.service" of the "Core" module
    Then the test "testDeletePerson_withCarNoPerson" is added to the integration tests of class "Car"

    Then the name "deleteCarWithPerson" is not added to class "IPersonController" in package "api.resource" of the "Api" module
    Then the name "deleteCarWithPerson" is not added to class "PersonController" in package "api.resource" of the "Api" module
    Then the unit test for "deleteCarWithPerson" is not added for the class "PersonController" in the package "api.resource" of the "Api" module
    Then the name "removeCar" is not added to class "PersonService" in package "core.service" of the "Core" module
    Then the unit test for "removeCar" is not added for the class "PersonService" in the package "core.service" of the "Core" module
    Then the test "testDeleteCar_withPerson" is not added to the integration tests of class "Person"


  Scenario: Add One-Many relation should add a relation with output of only the one side class
    When the NewMavenProject is run
    When the AddBeanClass is run with className "Person"
    When the AddIntegrationTestSetup is run for class "Person"
    When the AddDomainClass is run with className "Person"
    When the AddConverter is run with className "Person"
    When the AddResource is run with className "Person"
    When the AddService is run with className "Person"
    When the AddRepository is run with className "Person"
    When the AddSearchCriteria is run with className "Person"

    When the AddBeanClass is run with className "Car"
    When the AddIntegrationTestSetup is run for class "Car"
    When the AddDomainClass is run with className "Car"
    When the AddConverter is run with className "Car"
    When the AddResource is run with className "Car"
    When the AddService is run with className "Car"
    When the AddRepository is run with className "Car"
    When the AddSearchCriteria is run with className "Car"

    When the AddOneToManyRelation is run with one "Person" showing in output with many "Car" absent in output bi-directional, with "PUT" as methods on the one side and "<nothing>" as methods on the many side

    Then the combination changelog is extended with "FK_PERSON_CAR"
    Then the name "carSet" is added to class "Person" in package "persistence.db.hibernate.bean" of the "Persistence" module
    Then the name "person" is added to class "Car" in package "persistence.db.hibernate.bean" of the "Persistence" module
    Then the name "cars" is added to class "PersonConverter" in package "api.convert" of the "Api" module
    Then the name "persons" is not added to class "CarConverter" in package "api.convert" of the "Api" module

    Then the name "putPersonWithCar" is not added to class "ICarController" in package "api.resource" of the "Api" module
    Then the name "putPersonWithCar" is not added to class "CarController" in package "api.resource" of the "Api" module
    Then the unit test for "putPersonWithCar" is not added for the class "CarController" in the package "api.resource" of the "Api" module
    Then the name "updateCarWithPerson" is not added to class "CarService" in package "core.service" of the "Core" module
    Then the unit test for "updateCarWithPerson" is not added for the class "CarService" in the package "core.service" of the "Core" module
    Then the test "testPutPerson_withCarNoPerson" is not added to the integration tests of class "Car"

    Then the name "putCarWithPerson" is added to class "IPersonController" in package "api.resource" of the "Api" module
    Then the name "putCarWithPerson" is added to class "PersonController" in package "api.resource" of the "Api" module
    Then the unit test for "putCarWithPerson" is added for the class "PersonController" in the package "api.resource" of the "Api" module
    Then the name "updatePersonWithCar" is added to class "PersonService" in package "core.service" of the "Core" module
    Then the unit test for "updatePersonWithCar" is added for the class "PersonService" in the package "core.service" of the "Core" module
    Then the test "testPutCar_withPersonWithCar" is added to the integration tests of class "Person"

    Then the name "deletePersonWithCar" is not added to class "ICarController" in package "api.resource" of the "Api" module
    Then the name "deletePersonWithCar" is not added to class "CarController" in package "api.resource" of the "Api" module
    Then the unit test for "deletePersonWithCar" is not added for the class "CarController" in the package "api.resource" of the "Api" module
    Then the name "removePerson" is not added to class "CarService" in package "core.service" of the "Core" module
    Then the unit test for "removePerson" is not added for the class "CarService" in the package "core.service" of the "Core" module
    Then the test "testDeletePerson_withCarNoPerson" is not added to the integration tests of class "Car"

    Then the name "deleteCarWithPerson" is not added to class "IPersonController" in package "api.resource" of the "Api" module
    Then the name "deleteCarWithPerson" is not added to class "PersonController" in package "api.resource" of the "Api" module
    Then the unit test for "deleteCarWithPerson" is not added for the class "PersonController" in the package "api.resource" of the "Api" module
    Then the name "removeCar" is not added to class "PersonService" in package "core.service" of the "Core" module
    Then the unit test for "removeCar" is not added for the class "PersonService" in the package "core.service" of the "Core" module
    Then the test "testDeleteCar_withPerson" is not added to the integration tests of class "Person"


  Scenario: Add One-Many relation should add a relation with output of only the many side class
    When the NewMavenProject is run
    When the AddBeanClass is run with className "Person"
    When the AddIntegrationTestSetup is run for class "Person"
    When the AddDomainClass is run with className "Person"
    When the AddConverter is run with className "Person"
    When the AddResource is run with className "Person"
    When the AddService is run with className "Person"
    When the AddRepository is run with className "Person"
    When the AddSearchCriteria is run with className "Person"

    When the AddBeanClass is run with className "Car"
    When the AddIntegrationTestSetup is run for class "Car"
    When the AddDomainClass is run with className "Car"
    When the AddConverter is run with className "Car"
    When the AddResource is run with className "Car"
    When the AddService is run with className "Car"
    When the AddRepository is run with className "Car"
    When the AddSearchCriteria is run with className "Car"

    When the AddOneToManyRelation is run with one "Person" absent in output with many "Car" showing in output uni-directional, with "<nothing>" as methods on the one side and "DELETE" as methods on the many side

    Then the combination changelog is extended with "FK_PERSON_CAR"
    Then the name "carSet" is not added to class "Person" in package "persistence.db.hibernate.bean" of the "Persistence" module
    Then the name "person" is added to class "Car" in package "persistence.db.hibernate.bean" of the "Persistence" module
    Then the name "cars" is not added to class "PersonConverter" in package "api.convert" of the "Api" module
    Then the name "persons" is added to class "CarConverter" in package "api.convert" of the "Api" module

    Then the name "putPersonWithCar" is not added to class "ICarController" in package "api.resource" of the "Api" module
    Then the name "putPersonWithCar" is not added to class "CarController" in package "api.resource" of the "Api" module
    Then the unit test for "putPersonWithCar" is not added for the class "CarController" in the package "api.resource" of the "Api" module
    Then the name "updateCarWithPerson" is not added to class "CarService" in package "core.service" of the "Core" module
    Then the unit test for "updateCarWithPerson" is not added for the class "CarService" in the package "core.service" of the "Core" module
    Then the test "testPutPerson_withCarNoPerson" is not added to the integration tests of class "Car"

    Then the name "putCarWithPerson" is not added to class "IPersonController" in package "api.resource" of the "Api" module
    Then the name "putCarWithPerson" is not added to class "PersonController" in package "api.resource" of the "Api" module
    Then the unit test for "putCarWithPerson" is not added for the class "PersonController" in the package "api.resource" of the "Api" module
    Then the name "updatePersonWithCar" is not added to class "PersonService" in package "core.service" of the "Core" module
    Then the unit test for "updatePersonWithCar" is not added for the class "PersonService" in the package "core.service" of the "Core" module
    Then the test "testPutCar_withPersonWithCar" is not added to the integration tests of class "Person"

    Then the name "deletePersonWithCar" is added to class "ICarController" in package "api.resource" of the "Api" module
    Then the name "deletePersonWithCar" is added to class "CarController" in package "api.resource" of the "Api" module
    Then the unit test for "deletePersonWithCar" is added for the class "CarController" in the package "api.resource" of the "Api" module
    Then the name "removePerson" is added to class "CarService" in package "core.service" of the "Core" module
    Then the unit test for "removePerson" is added for the class "CarService" in the package "core.service" of the "Core" module
    Then the test "testDeletePerson_withCarNoPerson" is added to the integration tests of class "Car"

    Then the name "deleteCarWithPerson" is not added to class "IPersonController" in package "api.resource" of the "Api" module
    Then the name "deleteCarWithPerson" is not added to class "PersonController" in package "api.resource" of the "Api" module
    Then the unit test for "deleteCarWithPerson" is not added for the class "PersonController" in the package "api.resource" of the "Api" module
    Then the name "removeCar" is not added to class "PersonService" in package "core.service" of the "Core" module
    Then the unit test for "removeCar" is not added for the class "PersonService" in the package "core.service" of the "Core" module
    Then the test "testDeleteCar_withPerson" is not added to the integration tests of class "Person"
