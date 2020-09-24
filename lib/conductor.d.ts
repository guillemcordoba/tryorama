import { KillFn } from "./types";
import { AdminWebsocket, AppWebsocket } from '@holochain/conductor-api';
import * as T from './types';
export declare type CallAdminFunc = (method: string, params: Record<string, any>) => Promise<any>;
export declare type CallZomeFunc = (instanceId: string, zomeName: string, fnName: string, params: Record<string, any>) => Promise<any>;
/**
 * Representation of a running Conductor instance.
 * A [Player] spawns a conductor process locally or remotely and constructs this class accordingly.
 * Though Conductor is spawned externally, this class is responsible for establishing WebSocket
 * connections to the various interfaces to enable zome calls as well as admin and signal handling.
 */
export declare class Conductor {
    name: string;
    onSignal: ({ instanceId: string, signal: Signal }: {
        instanceId: any;
        signal: any;
    }) => void;
    logger: any;
    kill: KillFn;
    adminClient: AdminWebsocket | null;
    appClient: AppWebsocket | null;
    _adminWsUrl: string;
    _appWsUrl: string;
    _isInitialized: boolean;
    _rawConfig: T.RawConductorConfig;
    _wsClosePromise: Promise<void>;
    _onActivity: () => void;
    constructor({ name, kill, onSignal, onActivity, appWsUrl, adminWsUrl, rawConfig }: {
        name: any;
        kill: any;
        onSignal: any;
        onActivity: any;
        appWsUrl: any;
        adminWsUrl: any;
        rawConfig: any;
    });
    callZome: CallZomeFunc;
    initialize: () => Promise<void>;
    awaitClosed: () => Promise<void>;
    _connectInterfaces: () => Promise<void>;
}
export declare const cellIdFromInstanceId: (config: T.RawConductorConfig, instanceId: string) => [string, string];
