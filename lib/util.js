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
const fs = require('fs');
const fsp = require('fs').promises;
const axios_1 = require("axios");
const logger_1 = require("./logger");
exports.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.trace = (x, msg = '{T}') => (console.log(msg, `<${typeof x}>`, x), x);
exports.stringify = x => JSON.stringify(x, null, 2);
exports.stripPortFromUrl = url => {
    const i = url.lastIndexOf(':');
    const maybePort = url.substring(i + 1);
    if (maybePort.match(/^\d{1,5}$/)) {
        return url.substring(0, i);
    }
    else {
        throw new Error(`No port found in string "${url}"`);
    }
};
// from https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e
function promiseSerialArray(promises) {
    return promises.reduce((promise, p) => promise.then(result => p.then(Array.prototype.concat.bind(result))), Promise.resolve([]));
}
exports.promiseSerialArray = promiseSerialArray;
function promiseSerialObject(promises) {
    return Object.entries(promises).reduce((promise, [key, p]) => promise.then(result => p.then(v => Object.assign(result, { [key]: v }))), Promise.resolve({}));
}
exports.promiseSerialObject = promiseSerialObject;
/** @deprecated */
exports.downloadFile = ({ url, path, overwrite }) => __awaiter(void 0, void 0, void 0, function* () {
    if (overwrite) {
        yield _downloadFile({ url, path });
    }
    else {
        // only download file if it doesn't already exist at this path.
        yield fsp.access(path).catch(() => _downloadFile({ url, path }));
    }
});
/** @deprecated */
const _downloadFile = ({ url, path }) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.request({
        url: url,
        method: 'GET',
        responseType: 'stream',
        maxContentLength: 999999999999,
    }).catch(e => {
        logger_1.default.warn('axios error: ', parseAxiosError(e));
        throw e.response;
    });
    return new Promise((fulfill, reject) => {
        if (!response.status || response.status != 200) {
            reject(`Could not fetch ${url}, response was ${response.statusText} ${response.status}`);
        }
        else {
            const writer = fs.createWriteStream(path, { emitClose: true })
                .on("error", reject)
                .on("finish", () => {
                logger_1.default.debug("Download complete.");
                writer.close(fulfill);
            });
            logger_1.default.debug("Starting streaming download...");
            response.data.pipe(writer);
        }
    });
});
const parseAxiosError = e => {
    if ('config' in e && 'request' in e && 'response' in e) {
        return {
            request: {
                method: e.config.method,
                url: e.config.url,
                data: e.config.data,
            },
            response: !e.response ? e.response : {
                status: e.response.status,
                statusText: e.response.statusText,
                data: e.response.data,
            }
        };
    }
    else {
        return e;
    }
};
//# sourceMappingURL=util.js.map