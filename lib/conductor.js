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
const logger_1 = require("./logger");
const conductor_api_1 = require("@holochain/conductor-api");
const common_1 = require("./common");
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
    constructor({ name, kill, onSignal, onActivity, appWsUrl, adminWsUrl, rawConfig }) {
        this.callZome = (...a) => {
            throw new Error("Attempting to call zome function before conductor was initialized");
        };
        this.initialize = () => __awaiter(this, void 0, void 0, function* () {
            this._onActivity();
            yield this._connectInterfaces();
        });
        this.awaitClosed = () => this._wsClosePromise;
        this._connectInterfaces = () => __awaiter(this, void 0, void 0, function* () {
            this._onActivity();
            this.adminClient = yield conductor_api_1.AdminWebsocket.connect(this._adminWsUrl);
            this.logger.debug(`connectInterfaces :: connected admin interface at ${this._adminWsUrl}`);
            this.appClient = yield conductor_api_1.AppWebsocket.connect(this._appWsUrl, (signal) => {
                this._onActivity();
                console.info("got signal, doing nothing with it: %o", signal);
            });
            this.logger.debug(`connectInterfaces :: connected app interface at ${this._appWsUrl}`);
            // FIXME
            this.appClient = yield conductor_api_1.AppWebsocket.connect(this._appWsUrl, signal => {
                // TODO: do something meaningful with signals
                this.logger.info("received app signal: %o", signal);
            });
            this.logger.debug(`connectInterfaces :: connected app interface at ${this._appWsUrl}`);
            this.callZome = (instanceId, zomeName, fnName, payload) => {
                this._onActivity();
                const cellId = exports.cellIdFromInstanceId(this._rawConfig, instanceId);
                return this.appClient.callZome({
                    cell_id: cellId,
                    zome_name: zomeName,
                    cap: common_1.fakeCapSecret(),
                    fn_name: fnName,
                    payload: payload,
                    provenance: 'TODO'
                });
            };
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
        this.adminClient = null;
        this.appClient = null;
        this._adminWsUrl = adminWsUrl;
        this._appWsUrl = appWsUrl;
        this._isInitialized = false;
        this._rawConfig = rawConfig;
        this._wsClosePromise = Promise.resolve();
        this._onActivity = onActivity;
    }
}
exports.Conductor = Conductor;
exports.cellIdFromInstanceId = (config, instanceId) => {
    const instance = config.instances.find(i => i.id === instanceId);
    const dnaHash = config.dnas.find(d => d.id === instance.dna).hash;
    const agentKey = config.agents.find(a => a.id === instance.agent).public_address;
    return [dnaHash, agentKey];
};
//# sourceMappingURL=conductor.js.map