# Boot-api

This project enables you to generate and edit Spring Boot API code. This [Rug][rug] project lets you create a 
fully operational REST API from a database model of your choice.

[rug]: http://docs.atomist.com/

## Installing

The first step is to install the following items in order to run rugs locally:

-   [Rug CLI][rug-cli]
-   [Docker][docker]
-   [Maven][maven]
-   [Node.js][node]

[rug-cli]: http://docs.atomist.com/user-guide/interfaces/cli/install/
[docker]: https://docs.docker.com/install/
[maven]: https://maven.apache.org/install.html
[node]: https://nodejs.org/

Then install all dependencies.
```
> cd .atomist
> npm install
```

Next up install the rug archive locally from the root of this project:
```
> rug install
```

Then you are all set to use all the rugs in the project.

## Available rugs

To list all available rugs type:
```
> rug describe archive shboland:boot-api
```

Does a specific rug interest you? Type:
```
> rug describe shboland:boot-api:<rug-name>
```

### Example

First we need an existing project. We can use the available generator. Our project name will be 'customer-api'.
```
> rug generate shboland:boot-api:NewMavenProject customer-api
```

Now we can generate our first object, the Customer object.
```
> cd customer-api
> rug edit shboland:boot-api:ApiForBean \
               className=Customer       \
               basePackage=org.shboland
```

And lets say our customer has a name.
```
> rug edit shboland:boot-api:AddField   \
               className=Customer       \
               basePackage=org.shboland \
               fieldName=name           \
               type=String
```

Now build and start up the application
```
> mvn clean install
> docker-compose up
```

Try it out! With the [swagger UI] for your new API.

[swagger UI]: http://localhost:8888/api/swagger-ui.html

## Development

You might want to run the database separate
```
> docker-compose up postgres-container
```

And the application from your IDE or with:
```
> cd api
> mvn spring-boot:run
```

To test your self created rugs use the rug-cli:
```
> rug test
```

## Authors

* **Sybren Boland** - *Initial work* - [sybrenboland](https://github.com/sybrenboland)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE.txt](LICENSE.txt) file for details
