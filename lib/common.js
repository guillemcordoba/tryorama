"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notImplemented = new Error("Not implemented!");
exports.fakeCapSecret = () => Buffer.from(Array(64).fill('aa').join(''), 'hex');
//# sourceMappingURL=common.js.map