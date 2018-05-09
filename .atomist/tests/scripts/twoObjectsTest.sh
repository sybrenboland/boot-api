#!/usr/bin/env bash
rug generate shboland:boot-api:NewMavenProject basicTest;
cd basicTest;
rug edit shboland:boot-api:ApiForBean className=Person basePackage=org.shboland;
rug edit shboland:boot-api:AddField className=Person basePackage=org.shboland fieldName=age type=Integer;
rug edit shboland:boot-api:ApiForBean className=Shop basePackage=org.shboland;
rug edit shboland:boot-api:AddField className=Shop basePackage=org.shboland fieldName=number type=Long;


git init;
git add .;
git commit -m "Initial commit";

mvn clean install;
