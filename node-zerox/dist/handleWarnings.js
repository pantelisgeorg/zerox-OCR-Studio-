"use strict";
// Tesseract relies on node-fetch v2, which has a deprecated version of punycode
// Suppress the warning for now. Check in when teseract updates to node-fetch v3
// https://github.com/naptha/tesseract.js/issues/876
if (process.stderr.write === process.stderr.constructor.prototype.write) {
    var stdErrWrite_1 = process.stderr.write;
    process.stderr.write = function (chunk) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var str = Buffer.isBuffer(chunk) ? chunk.toString() : chunk;
        // Filter out the punycode deprecation warning
        if (str.includes("punycode")) {
            return true;
        }
        return stdErrWrite_1.apply(process.stderr, [chunk]);
    };
}
