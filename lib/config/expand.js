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
const R = require("ramda");
exports.expand = o => (a) => {
    const go = (o) => __awaiter(void 0, void 0, void 0, function* () {
        return R.is(Function, o)
            ? go(yield o(a))
            : R.is(Array, o)
                ? mapArray(o, go)
                : R.is(Object, o)
                    ? mapObject(o, go)
                    : o;
    });
    return go(o);
};
const mapArray = (a, f) => Promise.all(a.map(f));
const mapObject = (o, f) => R.pipe(R.toPairs, R.map(([key, val]) => __awaiter(void 0, void 0, void 0, function* () {
    return [key, yield f(val)];
})), x => Promise.all(x).then(R.fromPairs))(o);
//# sourceMappingURL=expand.js.map