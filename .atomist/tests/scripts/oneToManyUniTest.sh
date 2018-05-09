#!/usr/bin/env bash
rug generate shboland:boot-api:NewMavenProject oneToManyUniTest;
cd oneToManyUniTest;
rug edit shboland:boot-api:ApiForBean className=Person basePackage=org.shboland;
rug edit shboland:boot-api:AddField className=Person basePackage=org.shboland fieldName=name type=String;
rug edit shboland:boot-api:ApiForBean className=Car basePackage=org.shboland;
rug edit shboland:boot-api:AddField className=Car basePackage=org.shboland fieldName=automatic type=Boolean;

rug edit shboland:boot-api:AddOneToManyRelation classNameOne=Person classNameMany=Car basePackage=org.shboland biDirectional=false;

git init;
git add .;
git commit -m "Initial commit";

mvn clean install;
