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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const t = __importStar(require("io-ts"));
const io_ts_reporters_1 = require("io-ts-reporters");
const logger_1 = __importDefault(require("./logger"));
exports.decodeOrThrow = (validator, value, extraMsg = '') => {
    const result = validator.decode(value);
    const errors = io_ts_reporters_1.reporter(result);
    if (errors.length > 0) {
        const msg = `${extraMsg ? extraMsg + '\n' : ''}Tried to use an invalid value for a complex type and found the following problems:\n    - ${errors.join("\n    - ")}`;
        logger_1.default.error(msg);
        throw new Error(msg);
    }
    return result;
};
exports.adminWsUrl = ({ urlBase, port }) => `${urlBase}:${port}`;
exports.collapseFort = (fort, args) => __awaiter(void 0, void 0, void 0, function* () { return yield (_.isFunction(fort) ? fort(args) : _.cloneDeep(fort)); });
exports.AgentConfigV = t.intersection([
    t.type({
        id: t.string,
        name: t.string,
        keystore_file: t.string,
        public_address: t.string,
    }),
    t.partial({
        test_agent: t.boolean,
    })
]);
exports.DnaConfigV = t.intersection([
    t.type({
        id: t.string,
        file: t.string,
    }),
    t.partial({
        hash: t.string,
        uuid: t.string,
    })
]);
exports.StorageConfigV = t.any; // TODO
exports.RawInstanceConfigV = t.type({
    id: t.string,
    agent: t.string,
    dna: t.string,
});
exports.DryInstanceConfigV = t.intersection([
    t.type({
        id: t.string,
        agent: exports.AgentConfigV,
        dna: exports.DnaConfigV,
    }),
    t.partial({
        storage: exports.StorageConfigV,
    })
]);
exports.BridgeConfigV = t.type({
    handle: t.string,
    caller_id: t.string,
    callee_id: t.string,
});
exports.DpkiConfigV = t.type({
    instance_id: t.string,
    init_params: t.string,
});
exports.NetworkModeV = t.union([
    t.literal('n3h'),
    t.literal('memory'),
    t.literal('websocket'),
]);
exports.RawNetworkConfigV = t.record(t.string, t.any);
exports.NetworkConfigV = t.union([
    exports.NetworkModeV,
    exports.RawNetworkConfigV,
]);
exports.RawLoggerConfigV = t.record(t.string, t.any);
exports.RawTracingConfigV = t.record(t.string, t.any);
exports.LoggerConfigV = t.union([
    t.boolean,
    t.record(t.string, t.any),
]);
exports.CloudWatchLogsConfigV = t.partial({
    region: t.string,
    log_group_name: t.string,
    log_stream_name: t.string
});
exports.RawCloudWatchLogsConfigV = t.intersection([exports.CloudWatchLogsConfigV, t.type({
        type: t.literal('cloudwatchlogs')
    })]);
exports.LoggerMetricPublisherV = t.literal('logger');
exports.RawLoggerMetricPublisherV = t.type({
    type: exports.LoggerMetricPublisherV
});
exports.MetricPublisherConfigV = t.union([
    exports.LoggerMetricPublisherV,
    exports.CloudWatchLogsConfigV,
]);
exports.RawMetricPublisherConfigV = t.union([exports.RawCloudWatchLogsConfigV, exports.RawLoggerMetricPublisherV]);
exports.ConductorConfigCommonV = t.partial({
    bridges: t.array(exports.BridgeConfigV),
    dpki: exports.DpkiConfigV,
    network: exports.RawNetworkConfigV,
    logger: exports.RawLoggerConfigV,
    metric_publisher: exports.RawMetricPublisherConfigV,
});
/** Base representation of a Conductor */
exports.DryInstancesConfigV = t.array(exports.DryInstanceConfigV);
/** Shorthand representation of a Conductor,
 *  where keys of `instance` are used as instance IDs as well as agent IDs
 */
exports.SugaredInstancesConfigV = t.record(t.string, exports.DnaConfigV);
/** For situations where we can accept either flavor of config */
exports.EitherInstancesConfigV = t.union([exports.DryInstancesConfigV, exports.SugaredInstancesConfigV]);
//# sourceMappingURL=types.js.map