import { Waiter } from '@holochain/hachiko';
import * as T from "./types";
import { Player } from "./player";
import { TrycpClient } from './trycp';
declare type Modifiers = {
    singleConductor: boolean;
};
export declare class ScenarioApi {
    description: string;
    fail: Function;
    _localPlayers: Record<string, Player>;
    _trycpClients: Array<TrycpClient>;
    _uuid: string;
    _waiter: Waiter;
    _modifiers: Modifiers;
    _activityTimer: any;
    constructor(description: string, orchestratorData: any, uuid: string, modifiers?: Modifiers);
    players: (machines: T.ObjectS<T.PlayerConfigs>, spawnArgs?: any) => Promise<T.ObjectS<Player>>;
    consistency: (players?: Player[] | undefined) => Promise<number>;
    _getClient: (machineEndpoint: any) => Promise<TrycpClient | null>;
    _clearTimer: () => void;
    _restartTimer: () => void;
    _destroyLocalConductors: () => Promise<void>;
    /**
     * Only called externally when there is a test failure,
     * to ensure that players/conductors have been properly cleaned up
     */
    _cleanup: (signal?: any) => Promise<boolean[]>;
}
export {};
