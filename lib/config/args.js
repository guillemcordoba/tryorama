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
const common_1 = require("./common");
const get_port_cautiously_1 = require("./get-port-cautiously");
const fs = require('fs').promises;
/**
 * Function to generate the args for genConfig functions.
 * This can be overridden as part of Orchestrator config.
 *
 * NB: Since we are using ports, there is a small chance of a race condition
 * when multiple conductors are attempting to secure ports for their interfaces.
 * In the future it would be great to move to domain socket based interfaces.
 */
exports.localConfigSeedArgs = () => __awaiter(void 0, void 0, void 0, function* () {
    const interfacePort = yield get_port_cautiously_1.getPort();
    const configDir = yield common_1.tempDir();
    return { configDir, interfacePort };
});
//# sourceMappingURL=args.js.map