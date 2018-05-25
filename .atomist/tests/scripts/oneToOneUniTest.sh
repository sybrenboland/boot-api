#!/usr/bin/env bash
rug generate shboland:boot-api:NewMavenProject oneToOneUniTest;
cd oneToOneUniTest;
rug edit shboland:boot-api:ApiForBean className=Person basePackage=org.shboland;
rug edit shboland:boot-api:AddField className=Person basePackage=org.shboland fieldName=name type=String;
rug edit shboland:boot-api:ApiForBean className=Details basePackage=org.shboland;
rug edit shboland:boot-api:AddField className=Details basePackage=org.shboland fieldName=age type=Integer;

rug edit shboland:boot-api:AddOneToManyRelation classNameOne=Person classNameMany=Details basePackage=org.shboland biDirectional=false;

git init;
git add .;
git commit -m "Initial commit";

mvn clean install;
