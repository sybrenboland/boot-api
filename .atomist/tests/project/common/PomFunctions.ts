
export class PomFunctions {

    public basicPomContent(): string {
        const basicPomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
            `xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <artifactId>test</artifactId>
    <name>Test Pom</name>
    
    <parent>
        <groupId></groupId>
        <artifactId></artifactId>
        <version></version>
    </parent>
    
    <properties>
    </properties>

    <dependencies>
    </dependencies>
    
    <dependencyManagement>
        <dependencies>
        </dependencies>
    </dependencyManagement>
</project>
`;

        return basicPomContent;
    }

}

export const pomFunctions = new PomFunctions();
