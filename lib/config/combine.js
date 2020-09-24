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
const env_1 = require("../env");
const logger_1 = require("../logger");
exports.unsupportedMergeConfigs = (() => {
    let messageDisplayed = false;
    return (name) => {
        if (!messageDisplayed) {
            logger_1.default.warn(`

The config merging capability, as used by ${name}, is currently not maintained and not recommended for use.
The main use case for using this feature is to run a test designed for multiple Players
within a single Conductor using in-memory networking. Holochain in-memory networking is
currently unsupported, and so this middleware will remain so until that changes.

      `);
        }
        messageDisplayed = true;
    };
})();
exports.combineConfigs = (configs) => {
    exports.unsupportedMergeConfigs('combineConfigs');
    return (args) => __awaiter(void 0, void 0, void 0, function* () {
        const configsJson = yield _.chain(configs)
            .values().map(x => _.toPairs(x)).flatten() // throw away machine IDs
            .map(([name, c]) => __awaiter(void 0, void 0, void 0, function* () { return [name, yield c(args)]; }))
            .thru(x => Promise.all(x))
            .value()
            .then(cs => _.chain(cs)
            .fromPairs()
            .value());
        const merged = exports.mergeJsonConfigs(configsJson);
        return merged;
    });
};
/**
 * Define a standard way to add extra string to ID identifiers for use in combining configs
 * This is used to modify file paths as well, so it should result in a valid path.
 * i.e.:
 *     adjoin('x')('path/to/foo') === 'path/to/foo--x'   // OK
 *     adjoin('x')('path/to/foo') === 'x::path/to/foo'   // BAD
 */
exports.adjoin = tag => {
    if (typeof tag !== 'string' || '1234567890'.includes(tag[0])) {
        throw new Error(`Using invalid adjoin tag: ${tag}`);
    }
    return x => `${x}--${tag}`;
};
/**
 * Given a map with keys as conductor names and values as conductor configs Objects,
 * merge all configs into a single valid conductor config Object.
 * Basically, each agent ID is adjoined by the conductor name, and references updated
 * to preserve uniqueness. Then all agents, dnas, instances, and bridges are merged
 * together.
 *
 * All other options, like logging, interfaces, etc. are taken from one particular config,
 * with the assumption that the others are the same. The `standard` param allows you to
 * specify, by conductor name, which config to use to pull these other values from.
 */
exports.mergeJsonConfigs = (configs, standard) => {
    exports.unsupportedMergeConfigs('mergeJsonConfigs');
    const agents = _.chain(configs)
        .toPairs()
        .map(([name, c]) => _.chain(c.agents)
        .map(a => _.update(a, 'id', exports.adjoin(name)))
        .map(a => _.update(a, 'name', exports.adjoin(name)))
        .value())
        .flatten()
        .value();
    const dnas = _.chain(configs)
        .map(c => c.dnas)
        .flatten()
        .uniqBy(dna => dna.id)
        .value();
    const instances = _.chain(configs)
        .toPairs()
        .map(([name, c]) => _.map(c.instances, (inst) => _.chain(inst)
        .update('id', exports.adjoin(name))
        .update('agent', exports.adjoin(name))
        .thru(c => c.storage && c.storage.path ? _.update(c, 'storage.path', exports.adjoin(name)) : c)
        .value()))
        .flatten()
        .value();
    const bridges = _.chain(configs)
        .toPairs()
        .map(([name, c]) => _.map(c.bridges, b => _.chain(b)
        .update('caller_id', exports.adjoin(name))
        .update('callee_id', exports.adjoin(name))
        .value()))
        .flatten()
        .value();
    const first = standard ? configs[standard] : _.values(configs)[0];
    const interfaceIndex = _.findIndex(first.interfaces, i => i.id === env_1.default.interfaceId);
    const interfaceInstances = _.chain(configs)
        .toPairs()
        .map(([name, c]) => _.map(c.interfaces[interfaceIndex].instances, i => _.update(i, 'id', exports.adjoin(name))))
        .flatten()
        .value();
    const interfaces = _.set(first.interfaces, [interfaceIndex, 'instances'], interfaceInstances);
    const combined = _.assign(first, {
        agents,
        dnas,
        bridges,
        instances,
        interfaces,
    });
    return combined;
};
//# sourceMappingURL=combine.js.map