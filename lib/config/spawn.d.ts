import * as T from '../types';
import { TrycpClient } from "../trycp";
export declare const spawnTest: T.SpawnConductorFn;
export declare const spawnLocal: T.SpawnConductorFn;
export declare const spawnRemote: (trycp: TrycpClient, machineUrl: string) => T.SpawnConductorFn;
