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
const T = __importStar(require("../types"));
const _ = __importStar(require("lodash"));
const env_1 = __importDefault(require("../env"));
const logger_1 = __importDefault(require("../logger"));
const expand_1 = require("./expand");
const exec = require('util').promisify(require('child_process').exec);
const path = require('path');
// NB: very important! Consistency signals drive the hachiko Waiter,
// which is the special sauce behind `await s.consistency()`
const defaultCommonConfig = {
    signals: {
        trace: false,
        consistency: true,
    }
};
const defaultStorage = (configDir, instanceId) => {
    if (!configDir) {
        throw new Error("cannot set storage dir without configDir");
    }
    return {
        type: 'lmdb',
        path: path.join(configDir, instanceId)
    };
};
/**
 * The main purpose of this module. It is a helper function which accepts an object
 * describing instances in shorthand, as well as a second object describing the additional
 * more general config fields. It is usually the case that the first object will be vary
 * between players, and the second field will be the same between different players.
 */
exports.gen = (instancesFort, commonFort) => {
    // TODO: type check of `commonFort`
    // If we get a function, we can't type check until after the function has been called
    // ConfigSeedArgs
    let typeCheckLater = false;
    // It leads to more helpful error messages
    // to have this validation before creating the seed function
    if (_.isFunction(instancesFort)) {
        typeCheckLater = true;
    }
    else {
        validateInstancesType(instancesFort);
    }
    return (args) => __awaiter(void 0, void 0, void 0, function* () {
        const instancesData = yield T.collapseFort(instancesFort, args);
        if (typeCheckLater) {
            validateInstancesType(instancesData);
        }
        const instancesDry = _.isArray(instancesData)
            ? instancesData
            : exports.desugarInstances(instancesData, args);
        const specific = yield exports.genPartialConfigFromDryInstances(instancesDry, args);
        const common = _.merge({}, defaultCommonConfig, yield T.collapseFort(expand_1.expand(commonFort), args));
        return _.merge({}, specific, common);
    });
};
const validateInstancesType = (instances, msg = '') => {
    if (_.isArray(instances)) {
        T.decodeOrThrow(T.DryInstancesConfigV, instances, 'Could not validate Instances Array');
    }
    else if (_.isObject(instances)) {
        T.decodeOrThrow(T.SugaredInstancesConfigV, instances, 'Could not validate Instances Object');
    }
};
/**
 * 1. If a dna config object contains a URL in the path, download the file to a temp directory,
 *     and rewrite the path to point to downloaded file.
 * 2. Then, if the hash is not set, calculate the hash and set it.
 * 3. Add the UUID for this scenario
 */
exports.resolveDna = (inputDna, providedUuid) => __awaiter(void 0, void 0, void 0, function* () {
    const dna = _.cloneDeep(inputDna);
    dna.id = dna.uuid ? `${dna.id}::${dna.uuid}` : dna.id;
    dna.uuid = dna.uuid ? `${dna.uuid}::${providedUuid}` : providedUuid;
    if (!dna.hash) {
        dna.hash = !env_1.default.legacy ? "" : yield exports.getDnaHash(dna.file, dna.uuid).catch(err => {
            logger_1.default.warn(`Could not determine hash of DNA at '${dna.file}'. Note that tryorama cannot determine the hash of DNAs at URLs\n\tOriginal error: ${err}`);
            return "[UNKNOWN]";
        });
    }
    return dna;
});
exports.getConfigPath = configDir => path.join(configDir, 'conductor-config.toml');
exports.desugarInstances = (instances, args) => {
    T.decodeOrThrow(T.SugaredInstancesConfigV, instances);
    // time to desugar the object
    return Object.entries(instances).map(([id, dna]) => ({
        id,
        agent: exports.makeTestAgent(id, args),
        dna
    }));
};
exports.makeTestAgent = (id, { playerName, uuid }) => ({
    // NB: very important that agents have different names on different conductors!!
    name: `${playerName}::${id}::${uuid}`,
    id: id,
    keystore_file: '[UNUSED]',
    public_address: '[SHOULD BE REWRITTEN]',
    test_agent: true,
});
exports.genPartialConfigFromDryInstances = (instances, args) => __awaiter(void 0, void 0, void 0, function* () {
    const { configDir, adminInterfacePort, appInterfacePort, uuid } = args;
    const config = {
        agents: [],
        dnas: [],
        instances: [],
        persistence_dir: configDir,
    };
    const adminInterfaceConfig = {
        admin: true,
        choose_free_port: env_1.default.chooseFreePort,
        id: env_1.default.adminInterfaceId,
        driver: {
            type: 'websocket',
            port: adminInterfacePort,
        },
        instances: []
    };
    const appInterfaceConfig = {
        admin: false,
        choose_free_port: env_1.default.chooseFreePort,
        id: env_1.default.appInterfaceId,
        driver: {
            type: 'websocket',
            port: appInterfacePort,
        },
        instances: []
    };
    const agentIds = new Set();
    const dnaIds = new Set();
    for (const instance of instances) {
        if (!agentIds.has(instance.agent.id)) {
            config.agents.push(instance.agent);
            agentIds.add(instance.agent.id);
        }
        const resolvedDna = yield exports.resolveDna(instance.dna, uuid);
        if (!dnaIds.has(resolvedDna.id)) {
            config.dnas.push(resolvedDna);
            dnaIds.add(resolvedDna.id);
        }
        config.instances.push({
            id: instance.id,
            agent: instance.agent.id,
            dna: resolvedDna.id,
            storage: instance.storage || defaultStorage(configDir, instance.id)
        });
        appInterfaceConfig.instances.push({ id: instance.id });
    }
    config.interfaces = [adminInterfaceConfig, appInterfaceConfig];
    return config;
});
exports.getDnaHash = (dnaPath, uuid) => __awaiter(void 0, void 0, void 0, function* () {
    const { stdout, stderr } = yield exec(`hc hash -p ${dnaPath} -u ${uuid}`);
    if (!stdout) {
        throw new Error("Error while getting hash: " + stderr);
    }
    const [hash] = stdout.match(/\w{46}/);
    if (!hash) {
        let msg = "Could not parse hash from `hc hash` output, which follows: " + stdout;
        if (stderr) {
            msg += "`hc hash` also produced error output: " + stderr;
        }
        throw new Error(msg);
    }
    return hash;
});
exports.assertUniqueTestAgentNames = (configs) => {
    const agentNames = _.chain(configs).map(n => n.agents.filter(a => a.test_agent).map(a => a.name)).flatten().value();
    const frequencies = _.countBy(agentNames);
    const dupes = Object.entries(frequencies).filter(([k, v]) => v > 1);
    if (dupes.length > 0) {
        const display = dupes.reduce((s, [name, freq]) => `${s}\n(x${freq}): ${name}`, "");
        const msg = `There are ${dupes.length} non-unique test agent names specified across all conductor configs: ${display}`;
        logger_1.default.debug(msg);
        throw new Error(msg);
    }
};
//# sourceMappingURL=gen.js.map