import {File} from "@atomist/rug/model/File";
import {Project} from "@atomist/rug/model/Project";

export class LiquibaseFunctions {

    private basePath: string;
    private release: string;

    public checkRelease(project: Project, databaseModule: string, release: string) {

        this.release = release;
        this.basePath = databaseModule + '/src/main/resources/db/liquibase';

        const path = this.basePath + '/release/' + release + '/changelog.xml';
        if (!project.fileExists(path)) {

            this.addVersionToReleaseChangelog(project);
            this.copyChangelogFile(project, '/changelog.xml');
            this.tagChangelog(project, '/release/' + this.release + '/changelog.xml', 'release-' + this.release);
            this.copyChangelogFile(project, '/tables/tables-changelog.xml');
            this.copyChangelogFile(project, '/indexes/indexes-changelog.xml');
            this.copyChangelogFile(project, '/constraints/constraints-changelog.xml');
            this.copyChangelogFile(project, '/constraints/foreign-key/fk-changelog.xml');
            this.copyChangelogFile(project, '/constraints/primary-key/pk-changelog.xml');
        }
    }

    private addVersionToReleaseChangelog(project: Project) {

        const inputHook = '<!-- @Input -->';
        const rawChange = `<include file="${this.release}/changelog.xml" relativeToChangelogFile="true" />`;

        const path = this.basePath + '/release/release-changelog.xml';
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChange);
        }
    }

    private copyChangelogFile(project: Project, originPath: string) {
        const sourcePath = this.basePath + '/template' + originPath;
        const targetPath = this.basePath + '/release/' + this.release + originPath;

        if (!project.fileExists(targetPath)) {
            project.copyFile(sourcePath, targetPath);
        }
    }

    private tagChangelog(project: Project, originPath: string, tag: string) {

        const inputHook = '<!-- @Input -->';
        const rawChange = `<changeSet id="tag-${tag}" author="shboland" logicalFilePath="/release/${this.release}/changelog.xml">
        <tagDatabase tag="${tag}" />
    </changeSet>`;

        const path = this.basePath + originPath;
        if (project.fileExists(path)) {
            const file: File = project.findFile(path);
            file.replace(inputHook, rawChange);
        }
    }
}

export const liquibaseFunctions = new LiquibaseFunctions();
