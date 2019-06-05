"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.never = function (arg) {
    throw new Error("Invalid arg: " + arg);
};
