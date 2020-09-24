import { Conductor } from './conductor';
import { Instance } from './instance';
import { SpawnConductorFn, ObjectS, RawConductorConfig } from './types';
import { CellId, CallZomeRequest, AdminWebsocket } from '@holochain/conductor-api';
declare type ConstructorArgs = {
    name: string;
    config: RawConductorConfig;
    configDir: string;
    adminInterfacePort: number;
    appInterfacePort: number;
    onSignal: ({ instanceId: string, signal: Signal }: {
        instanceId: any;
        signal: any;
    }) => void;
    onJoin: () => void;
    onLeave: () => void;
    onActivity: () => void;
    spawnConductor: SpawnConductorFn;
};
declare type CallArgs = [CallZomeRequest] | [string, string, string, any];
/**
 * Representation of a Conductor user.
 * A Player is essentially a wrapper around a conductor config that was generated,
 * and the possible reference to a conductor which is running based on that config.
 * The Player can spawn or kill a conductor based on the generated config.
 * Players are the main interface for writing scenarios.
 */
export declare class Player {
    name: string;
    logger: any;
    config: RawConductorConfig;
    onJoin: () => void;
    onLeave: () => void;
    onSignal: ({ instanceId: string, signal: Signal }: {
        instanceId: any;
        signal: any;
    }) => void;
    onActivity: () => void;
    _conductor: Conductor | null;
    _cellIds: ObjectS<CellId>;
    _configDir: string;
    _adminInterfacePort: number;
    _appInterfacePort: number;
    _spawnConductor: SpawnConductorFn;
    constructor({ name, config, configDir, adminInterfacePort, appInterfacePort, onJoin, onLeave, onSignal, onActivity, spawnConductor }: ConstructorArgs);
    admin: () => AdminWebsocket;
    call: (...args: CallArgs) => any;
    cellId: (nick: string) => [string, import("@holochain/conductor-api").AgentPubKey];
    stateDump: (nick: string) => Promise<any>;
    /**
     * Get a particular Instance of this conductor.
     * The reason for supplying a getter rather than allowing direct access to the collection
     * of instances is to allow middlewares to modify the instanceId being retrieved,
     * especially for singleConductor middleware
     */
    instance: (instanceId: any) => void;
    instances: (filterPredicate?: any) => Instance[];
    /**
     * Spawn can take a function as an argument, which allows the caller
     * to do something with the child process handle, even before the conductor
     * has fully started up. Otherwise, by default, you will have to wait for
     * the proper output to be seen before this promise resolves.
     */
    spawn: (spawnArgs: any) => Promise<void>;
    kill: (signal?: string) => Promise<boolean>;
    /** Runs at the end of a test run */
    cleanup: (signal?: string) => Promise<boolean>;
    _setCellNicks: () => Promise<void>;
    _conductorGuard: (context: any) => void;
}
export {};
