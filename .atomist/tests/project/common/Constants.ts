
export const BasePackage = "org.shboland";
export const Release = "2.0.0";

export const ApiModule = "apiModule";
export const CoreModule = "coreModule";
export const PersistenceModule = "persistenceModule";
export const DomainModule = "domainModule";
export const DatabaseModule = "databaseModule";

export function getModule(search: string) {
    switch (search) {
        case "Api":
            return this.ApiModule;
        case "Core":
            return this.CoreModule;
        case "Persistence":
            return this.PersistenceModule;
        case "Domain":
            return this.DomainModule;
        case "Database":
            return this.DatabaseModule;
    }
}
