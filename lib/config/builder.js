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
const path = require('path');
const _ = require("lodash");
const common_1 = require("./common");
const gen_1 = require("./gen");
const logger_1 = require("./logger");
const genDnaConfig = (file, id, opts = {}) => {
    if (!id) {
        id = common_1.dnaPathToId(file);
    }
    return Object.assign({ file, id }, opts);
};
const genDpkiConfig = (instanceId, initParams) => ({
    instance_id: instanceId,
    init_params: JSON.stringify(initParams),
});
const genBridgeConfig = (handle, caller_id, callee_id) => ({
    caller_id, callee_id, handle
});
const genNetworkConfig = (network) => ({ configDir }) => __awaiter(void 0, void 0, void 0, function* () {
    const dir = path.join(configDir, 'network-storage');
    yield common_1.mkdirIdempotent(dir);
    const lib3hConfig = type => ({
        type,
        work_dir: '',
        log_level: 'd',
        bind_url: `http://0.0.0.0`,
        dht_custom_config: [],
        dht_timeout_threshold: 8000,
        dht_gossip_interval: 500,
        bootstrap_nodes: [],
        network_id: {
            nickname: 'app_spec',
            id: 'app_spec_memory',
        },
        transport_configs: [
            {
                type,
                data: type === 'memory' ? 'app-spec-memory' : 'Unencrypted',
            }
        ]
    });
    if (network === 'memory' || network === 'websocket') {
        return lib3hConfig(network);
    }
    else if (network === 'n3h') {
        return {
            type: 'n3h',
            n3h_log_level: 'e',
            bootstrap_nodes: [],
            n3h_mode: 'REAL',
            n3h_persistence_path: dir,
        };
    }
    else if (typeof network === 'object') {
        return network;
    }
    else {
        throw new Error("Unsupported network type: " + network);
    }
});
const genLoggerConfig = (logger) => {
    if (typeof logger === 'boolean') {
        return logger ? logger_1.saneLoggerConfig : logger_1.quietLoggerConfig;
    }
    else {
        return logger;
    }
};
const genMetricPublisherConfig = (mp) => {
    if (mp == 'logger') {
        return {
            type: 'logger'
        };
    }
    else if (_.isObject(mp)) {
        return {
            type: 'cloudwatchlogs',
            log_group_name: mp.log_group_name,
            log_stream_name: mp.log_stream_name,
            region: mp.region
        };
    }
    else {
        throw new Error("Unsupported metric publisher type: " + mp);
    }
};
exports.default = {
    gen: gen_1.gen,
    dna: genDnaConfig,
    dpki: genDpkiConfig,
    bridge: genBridgeConfig,
    network: genNetworkConfig,
    logger: genLoggerConfig,
    metricPublisher: genMetricPublisherConfig,
};
//# sourceMappingURL=builder.js.map