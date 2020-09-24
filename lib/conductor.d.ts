import { KillFn } from "./types";
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
    _interfaceWsUrl: string;
    _hcConnect: any;
    _isInitialized: boolean;
    _wsClosePromise: Promise<void>;
    _onActivity: () => void;
    constructor({ name, kill, onSignal, onActivity, interfaceWsUrl }: {
        name: any;
        kill: any;
        onSignal: any;
        onActivity: any;
        interfaceWsUrl: any;
    });
    callAdmin: CallAdminFunc;
    callZome: CallZomeFunc;
    initialize: () => Promise<void>;
    wsClosed: () => Promise<void>;
    _connectInterface: () => Promise<void>;
}
