#!/usr/bin/env bash
rug generate shboland:boot-api:NewMavenProject manyToManyUniTest;
cd manyToManyUniTest;
rug edit shboland:boot-api:ApiForBean className=Person basePackage=org.shboland;
rug edit shboland:boot-api:AddField className=Person basePackage=org.shboland fieldName=age type=Integer;
rug edit shboland:boot-api:ApiForBean className=Shop basePackage=org.shboland;
rug edit shboland:boot-api:AddField className=Shop basePackage=org.shboland fieldName=number type=Long;

rug edit shboland:boot-api:AddManyToManyRelation classNameMappedBy=Person classNameOther=Shop basePackage=org.shboland biDirectional=false;

git init;
git add .;
git commit -m "Initial commit";

mvn clean install;
