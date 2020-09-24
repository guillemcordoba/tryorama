"use strict";
/**
 * Allows "parking" (and unparking) of ports.
 * getPorts will find a port which is not used by another process
 * AND has not beed parked.
 * This prevents port collisions when instantiating multiple conductor simultaneously,
 * as well as the chance of another process taking the port specified in a conductor config
 * in between killing and spawning the same conductor
 */
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
const async_mutex_1 = require("async-mutex");
const env_1 = require("../env");
const getPortRaw = require('get-port');
const portMutex = new async_mutex_1.Mutex();
const PARKED_PORTS = new Set();
const [rangeLo, rangeHi] = env_1.default.portRange;
let nextPort = rangeLo;
exports.getPort = () => portMutex.runExclusive(() => __awaiter(void 0, void 0, void 0, function* () {
    let port = 0;
    do {
        port = yield getPortRaw({ port: getPortRaw.makeRange(nextPort, rangeHi) });
        nextPort += 1;
        if (nextPort >= rangeHi) {
            nextPort = rangeLo;
        }
    } while (PARKED_PORTS.has(port));
    PARKED_PORTS.add(port);
    return port;
}));
// export const parkPort = port => PARKED_PORTS.add(port)
exports.unparkPort = port => PARKED_PORTS.delete(port);
//# sourceMappingURL=get-port-cautiously.js.map