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
const colors = require('colors/safe');
const hcWebClient = require('@holochain/hc-web-client');
const logger_1 = require("./logger");
const util_1 = require("./util");
const env_1 = require("./env");
// probably unnecessary, but it can't hurt
// TODO: bump this gradually down to 0 until we can maybe remove it altogether
const WS_CLOSE_DELAY_FUDGE = 500;
/**
 * Representation of a running Conductor instance.
 * A [Player] spawns a conductor process locally or remotely and constructs this class accordingly.
 * Though Conductor is spawned externally, this class is responsible for establishing WebSocket
 * connections to the various interfaces to enable zome calls as well as admin and signal handling.
 */
class Conductor {
    constructor({ name, kill, onSignal, onActivity, interfaceWsUrl }) {
        this.callAdmin = (...a) => {
            // Not supporting admin functions because currently adding DNAs, instances, etc.
            // is undefined behavior, since the Waiter needs to know about all DNAs in existence,
            // and it's too much of a pain to track all of that with mutable conductor config.
            // If admin functions are added, then a hook must be added as well to update Waiter's
            // NetworkModels as new DNAs and instances are added/removed.
            throw new Error("Admin functions are currently not supported.");
        };
        this.callZome = (...a) => {
            throw new Error("Attempting to call zome function before conductor was initialized");
        };
        this.initialize = () => __awaiter(this, void 0, void 0, function* () {
            this._onActivity();
            yield this._connectInterface();
        });
        this.wsClosed = () => this._wsClosePromise;
        this._connectInterface = () => __awaiter(this, void 0, void 0, function* () {
            this._onActivity();
            const url = this._interfaceWsUrl;
            this.logger.debug(`connectInterface :: connecting to ${url}`);
            const { call, callZome, onSignal, ws } = yield this._hcConnect({ url });
            this.logger.debug(`connectInterface :: connected to ${url}`);
            this._wsClosePromise = (
            // Wait for a constant delay and for websocket to close, whichever happens *last*
            Promise.all([
                new Promise(resolve => ws.on('close', resolve)),
                util_1.delay(WS_CLOSE_DELAY_FUDGE),
            ]).then(() => { }));
            this.callAdmin = (method, params) => __awaiter(this, void 0, void 0, function* () {
                this._onActivity();
                if (!method.match(/^admin\/.*\/list$/)) {
                    this.logger.warn("Calling admin functions which modify state during tests may result in unexpected behavior!");
                }
                this.logger.debug(`${colors.yellow.bold("[setup call on %s]:")} ${colors.yellow.underline("%s")}`, this.name, method);
                this.logger.debug(JSON.stringify(params, null, 2));
                const result = yield call(method)(params);
                this.logger.debug(`${colors.yellow.bold('-> %o')}`, result);
                return result;
            });
            onSignal(data => {
                const { signal, instance_id } = data;
                this.logger.silly('onSignal:', data);
                if (!signal || signal.signal_type !== 'Consistency') {
                    // not a consistency signal, or some other kind of data being sent down the pipe
                    return;
                }
                this._onActivity();
                this.onSignal({
                    instanceId: instance_id,
                    signal
                });
            });
            this.callZome = (instanceId, zomeName, fnName, params) => new Promise((resolve, reject) => {
                this._onActivity();
                this.logger.debug(`${colors.cyan.bold("zome call [%s]:")} ${colors.cyan.underline("{id: %s, zome: %s, fn: %s}")}`, this.name, instanceId, zomeName, fnName);
                this.logger.debug(`${colors.cyan.bold("params:")} ${colors.cyan.underline("%s")}`, JSON.stringify(params, null, 2));
                const timeoutSoft = env_1.default.zomeCallTimeoutMs / 2;
                const timeoutHard = env_1.default.zomeCallTimeoutMs;
                const callInfo = `${zomeName}/${fnName}`;
                const timerSoft = setTimeout(() => this.logger.warn(`Zome call '${callInfo}' has been running for more than ${timeoutSoft / 1000} seconds. Continuing to wait...`), timeoutSoft);
                const timerHard = setTimeout(() => {
                    const msg = `zome call timed out after ${timeoutHard / 1000} seconds on conductor '${this.name}': ${instanceId}/${zomeName}/${fnName}`;
                    if (env_1.default.stateDumpOnError) {
                        this.callAdmin('debug/state_dump', { instance_id: instanceId }).then(dump => {
                            this.logger.error("STATE DUMP:");
                            this.logger.error(JSON.stringify(dump, null, 2));
                        }).catch(err => this.logger.error("Error while calling debug/state_dump: %o", err))
                            .then(() => reject(msg));
                    }
                    else {
                        reject(msg);
                    }
                }, timeoutHard);
                callZome(instanceId, zomeName, fnName)(params).then(json => {
                    this._onActivity();
                    const result = JSON.parse(json);
                    this.logger.debug(`${colors.cyan.bold('->')} %o`, result);
                    resolve(result);
                })
                    .catch(reject)
                    .finally(() => {
                    clearTimeout(timerSoft);
                    clearTimeout(timerHard);
                });
            });
        });
        this.name = name;
        this.logger = logger_1.makeLogger(`tryorama conductor ${name}`);
        this.logger.debug("Conductor constructing");
        this.onSignal = onSignal;
        this.kill = (signal) => __awaiter(this, void 0, void 0, function* () {
            this.logger.debug("Killing...");
            yield kill(signal);
            return this._wsClosePromise;
        });
        this._interfaceWsUrl = interfaceWsUrl;
        this._hcConnect = hcWebClient.connect;
        this._isInitialized = false;
        this._wsClosePromise = Promise.resolve();
        this._onActivity = onActivity;
    }
}
exports.Conductor = Conductor;
//# sourceMappingURL=conductor.js.map