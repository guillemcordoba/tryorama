"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const instance_1 = require("./instance");
const logger_1 = require("./logger");
const get_port_cautiously_1 = require("./config/get-port-cautiously");
/**
 * Representation of a Conductor user.
 * A Player is essentially a wrapper around a conductor config that was generated,
 * and the possible reference to a conductor which is running based on that config.
 * The Player can spawn or kill a conductor based on the generated config.
 * Players are the main interface for writing scenarios.
 */
class Player {
    constructor({ name, config, configDir, interfacePort, onJoin, onLeave, onSignal, onActivity, spawnConductor }) {
        this.admin = (method, params) => __awaiter(this, void 0, void 0, function* () {
            this._conductorGuard(`admin(${method}, ${JSON.stringify(params)})`);
            return this._conductor.callAdmin(method, params);
        });
        this.call = (...args) => __awaiter(this, void 0, void 0, function* () {
            const [instanceId, zome, fn, params] = args;
            if (args.length != 4 || typeof instanceId !== 'string' || typeof zome !== 'string' || typeof fn !== 'string') {
                throw new Error("player.call() must take 4 arguments: (instanceId, zomeName, funcName, params)");
            }
            this._conductorGuard(`call(${instanceId}, ${zome}, ${fn}, ${JSON.stringify(params)})`);
            return this._conductor.callZome(instanceId, zome, fn, params);
        });
        this.stateDump = (id) => this.instance(id).stateDump();
        /**
         * Get a particular Instance of this conductor.
         * The reason for supplying a getter rather than allowing direct access to the collection
         * of instances is to allow middlewares to modify the instanceId being retrieved,
         * especially for singleConductor middleware
         */
        this.instance = (instanceId) => {
            this._conductorGuard(`instance(${instanceId})`);
            return _.cloneDeep(this._instances[instanceId]);
        };
        this.instances = (filterPredicate) => {
            return _.flow(_.values, _.filter(filterPredicate), _.cloneDeep)(this._instances);
        };
        /**
         * @deprecated in 0.1.2
         * Use `player.instance(instanceId)` instead
         */
        this.info = (instanceId) => this.instance(instanceId);
        /**
         * Spawn can take a function as an argument, which allows the caller
         * to do something with the child process handle, even before the conductor
         * has fully started up. Otherwise, by default, you will have to wait for
         * the proper output to be seen before this promise resolves.
         */
        this.spawn = (spawnArgs) => __awaiter(this, void 0, void 0, function* () {
            if (this._conductor) {
                this.logger.warn(`Attempted to spawn conductor '${this.name}' twice!`);
                return;
            }
            yield this.onJoin();
            this.logger.debug("spawning");
            const conductor = yield this._spawnConductor(this, spawnArgs);
            this.logger.debug("spawned");
            this._conductor = conductor;
            this.logger.debug("initializing");
            yield this._conductor.initialize();
            yield this._setInstances();
            this.logger.debug("initialized");
        });
        this.kill = (signal = 'SIGINT') => __awaiter(this, void 0, void 0, function* () {
            if (this._conductor) {
                const c = this._conductor;
                this._conductor = null;
                this.logger.debug("Killing...");
                yield c.kill(signal);
                this.logger.debug("Killed.");
                yield this.onLeave();
                return true;
            }
            else {
                this.logger.warn(`Attempted to kill conductor '${this.name}' twice`);
                return false;
            }
        });
        /** Runs at the end of a test run */
        this.cleanup = (signal = 'SIGINT') => __awaiter(this, void 0, void 0, function* () {
            this.logger.debug("calling Player.cleanup, conductor: %b", this._conductor);
            if (this._conductor) {
                yield this.kill(signal);
                get_port_cautiously_1.unparkPort(this._interfacePort);
                return true;
            }
            else {
                get_port_cautiously_1.unparkPort(this._interfacePort);
                return false;
            }
        });
        this._setInstances = () => __awaiter(this, void 0, void 0, function* () {
            const agentList = yield this._conductor.callAdmin("admin/agent/list", {});
            const dnaList = yield this._conductor.callAdmin("admin/dna/list", {});
            const instanceList = yield this._conductor.callAdmin("admin/instance/list", {});
            instanceList.forEach(i => {
                const agent = agentList.find(a => a.id === i.agent);
                const dna = dnaList.find(d => d.id === i.dna);
                if (!agent) {
                    throw new Error(`Instance '${i.id}' refers to nonexistant agent id '${i.agent}'`);
                }
                if (!dna) {
                    throw new Error(`Instance '${i.id}' refers to nonexistant dna id '${i.dna}'`);
                }
                this._instances[i.id] = new instance_1.Instance({
                    id: i.id,
                    agentAddress: agent.public_address,
                    dnaAddress: dna.hash,
                    callAdmin: (method, params) => this._conductor.callAdmin(method, params),
                    callZome: (zome, fn, params) => this._conductor.callZome(i.id, zome, fn, params)
                });
            });
        });
        this._conductorGuard = (context) => {
            if (this._conductor === null) {
                const msg = `Attempted conductor action when no conductor is running! You must \`.spawn()\` first.\nAction: ${context}`;
                this.logger.error(msg);
                throw new Error(msg);
            }
            else {
                this.logger.debug(context);
            }
        };
        this.name = name;
        this.logger = logger_1.makeLogger(`player ${name}`);
        this.onJoin = onJoin;
        this.onLeave = onLeave;
        this.onSignal = onSignal;
        this.onActivity = onActivity;
        this.config = config;
        this._conductor = null;
        this._instances = {};
        this._configDir = configDir;
        this._interfacePort = interfacePort;
        this._spawnConductor = spawnConductor;
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map