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
const hc_web_client_1 = require("@holochain/hc-web-client");
const logger_1 = require("./logger");
const base64 = require('base-64');
const TOML = require('@iarna/toml');
exports.trycpSession = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const { call, close } = yield hc_web_client_1.connect({ url });
    const makeCall = (method) => (a) => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.debug(`trycp client request to ${url}: ${method} => ${JSON.stringify(a, null, 2)}`);
        const result = yield call(method)(a);
        logger_1.default.debug('trycp client response: %j', result);
        return result;
    });
    return {
        setup: (id) => makeCall('setup')({ id }),
        dna: (url) => makeCall('dna')({ url }),
        player: (id, config) => makeCall('player')({ id, config: base64.encode(TOML.stringify(config)) }),
        spawn: (id) => makeCall('spawn')({ id }),
        kill: (id, signal) => makeCall('kill')({ id, signal }),
        ping: (id) => makeCall('ping')({ id }),
        reset: () => makeCall('reset')({}),
        closeSession: () => close(),
    };
});
//# sourceMappingURL=trycp.js.map