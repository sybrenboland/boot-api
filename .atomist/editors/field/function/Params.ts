export class Params {

    constructor(
        public basePath: string,
        public biDirectional: string,
        public basePackage: string,
        public persistenceModule: string,
        public apiModule: string,
        public databaseModule: string,
        public coreModule: string,
        public release: string,
    ) {}
}
