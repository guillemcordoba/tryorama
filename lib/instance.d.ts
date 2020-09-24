declare type CallAdminFunc = (method: string, params: Record<string, any>) => Promise<any>;
declare type CallZomeFunc = (zome: string, fn: string, params: any) => Promise<any>;
declare type InstanceConstructorParams = {
    id: string;
    dnaAddress: string;
    agentAddress: string;
    callAdmin: CallAdminFunc;
    callZome: CallZomeFunc;
};
/**
 * Handy reference to an instance within a Conductor.
 * Rather than using conductor.call('instanceId', 'zomeName', 'funcName', params), you can:
 * `conductor.instances[instanceId].call('zomeName', 'funcName', params)`
 */
export declare class Instance {
    id: string;
    _callAdmin: CallAdminFunc;
    _callZome: CallZomeFunc;
    agentAddress: string;
    dnaAddress: string;
    constructor(o: InstanceConstructorParams);
    call: (...args: any[]) => Promise<any>;
    stateDump: () => Promise<any>;
}
export {};
