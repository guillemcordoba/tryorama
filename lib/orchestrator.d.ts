import * as T from "./types";
import * as M from "./middleware";
import * as R from "./reporter";
import { WaiterOptions } from "@holochain/hachiko";
import { ScenarioApi } from "./api";
declare type OrchestratorConstructorParams<S> = {
    reporter?: boolean | R.Reporter;
    waiter?: WaiterOptions;
    middleware?: M.Middleware<S, M.Scenario<ScenarioApi>>;
    mode?: ModeOpts;
};
declare type ModeOpts = {
    executor: 'none' | 'tape' | {
        tape: any;
    };
    spawning: 'local' | 'remote' | T.SpawnConductorFn;
};
declare type ScenarioModifier = 'only' | 'skip' | null;
declare type RegisteredScenario = {
    api: ScenarioApi;
    desc: string;
    execute: ScenarioExecutor;
    modifier: ScenarioModifier;
};
export declare type Register = (desc: string, scenario: Function) => void;
export declare type TestStats = {
    successes: number;
    errors: Array<TestError>;
};
declare type TestError = {
    description: string;
    error: any;
};
declare type ScenarioExecutor = () => Promise<void>;
export declare class Orchestrator<S> {
    registerScenario: Register & {
        only: Register;
        skip: Register;
    };
    waiterConfig?: WaiterOptions;
    _middleware: M.Middleware<S, M.Scenario<ScenarioApi>>;
    _scenarios: Array<RegisteredScenario>;
    _reporter: R.Reporter;
    constructor(o?: OrchestratorConstructorParams<S>);
    numRegistered: () => number;
    run: () => Promise<TestStats>;
    _executeParallel: (tests: RegisteredScenario[]) => Promise<{
        successes: number;
        errors: TestError[];
    }>;
    _registerScenario: (desc: string, scenario: S, modifier: ScenarioModifier) => void;
}
export {};
