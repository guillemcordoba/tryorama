declare const VARS: {
    adminInterfaceId: string;
    appInterfaceId: string;
    stateDumpOnError: boolean;
    zomeCallTimeoutMs: number;
    conductorTimeoutMs: number;
    strictConductorTimeout: boolean;
    tempStorage: string | undefined;
    chooseFreePort: boolean;
    logLevel: string | undefined;
    portRange: number[];
    legacy: boolean;
    holochainPath: string;
};
export default VARS;
