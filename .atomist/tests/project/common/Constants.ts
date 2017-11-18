
export const BasePackage = "org.shboland";
export const Release = "2.0.0";

export const ApiModule = "apiModule";
export const PersistenceModule = "persistenceModule";
export const DomainModule = "domainModule";

export function getModule(search: string) {
    switch (search) {
        case "Api":
            return this.ApiModule;
        case "Persistence":
            return this.PersistenceModule;
        case "Domain":
            return this.DomainModule;
    }
}
