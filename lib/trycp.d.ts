import * as T from './types';
export declare type TrycpClient = {
    setup: (id: any) => Promise<T.PartialConfigSeedArgs>;
    dna: (url: string) => Promise<{
        path: string;
    }>;
    player: (id: any, config: T.RawConductorConfig) => Promise<any>;
    spawn: (id: any) => Promise<any>;
    kill: (id: any, signal?: any) => Promise<any>;
    ping: (id: any) => Promise<string>;
    reset: () => Promise<void>;
    closeSession: () => Promise<void>;
};
export declare const trycpSession: (url: any) => Promise<TrycpClient>;
