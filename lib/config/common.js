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
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const env_1 = require("../env");
exports.mkdirIdempotent = dir => fs.access(dir).catch(() => {
    fs.mkdir(dir, { recursive: true });
});
const tempDirBase = path.join(env_1.default.tempStorage || os.tmpdir(), 'tryorama/');
exports.mkdirIdempotent(tempDirBase);
exports.tempDir = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.mkdirIdempotent(tempDirBase);
    return fs.mkdtemp(tempDirBase);
});
/**
 * Directory to store downloaded DNAs in.
 * **NOTE**: this is currently shared among all runs over all time, for better caching.
 * TODO: change this to `tempDir` instead of `tempDirBase` to remove this overzealous caching!
 */
exports.dnaDir = () => __awaiter(void 0, void 0, void 0, function* () {
    const dir = path.join(tempDirBase, 'dnas-fetched');
    yield exports.mkdirIdempotent(dir);
    return dir;
});
exports.dnaPathToId = (dnaPath) => {
    const matches = dnaPath.match(/([^/]+)$/g);
    return matches[0].replace(/\.dna\.json$/, '');
};
//# sourceMappingURL=common.js.map