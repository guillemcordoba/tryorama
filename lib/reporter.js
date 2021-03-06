"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require('lodash');
const noop = (..._x) => { };
exports.unit = ({
    before: noop,
    each: noop,
    after: noop,
});
exports.basic = log => ({
    before: total => log(`(tryorama)  Running ${total} scenarios`),
    each: desc => log(`τ  ${desc}`),
    after: ({ successes, errors }) => {
        const total = successes + errors.length;
        log(`(tryorama)  Orchestrator test run complete:
${total} total scenarios
${successes} successes
${errors.length > 0 ? `${errors.length} errors:` : '0 errors'}
\t${errors.map(formatError).join('\n\t')}
`);
    },
});
const formatError = ({ description, error }) => {
    if (error instanceof Error) {
        error = error.toString();
    }
    else if (_.isObject(error)) {
        error = JSON.stringify(error, null, 2);
    }
    return `( ${description} ): ${error}`;
};
//# sourceMappingURL=reporter.js.map