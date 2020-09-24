"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Handy reference to an instance within a Conductor.
 * Rather than using conductor.call('instanceId', 'zomeName', 'funcName', params), you can:
 * `conductor.instances[instanceId].call('zomeName', 'funcName', params)`
 */
class Instance {
    constructor(o) {
        this.call = (...args) => {
            const [zome, fn, params] = args;
            if (args.length !== 3 || typeof zome !== 'string' || typeof fn !== 'string') {
                throw new Error("instance.call() must take 3 arguments: (zomeName, funcName, params)");
            }
            return this._callZome(zome, fn, params);
        };
        this.stateDump = () => {
            return Promise.resolve('TODO');
            // return this.admin.stateDump({ cell_id: this.id })
        };
        this.id = o.id;
        this.admin = o.adminClient;
        this._callZome = o.callZome;
        this.agentAddress = o.agentAddress;
        this.dnaAddress = o.dnaAddress;
    }
}
exports.Instance = Instance;
//# sourceMappingURL=instance.js.map