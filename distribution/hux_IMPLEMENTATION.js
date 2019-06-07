"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hux_1 = require("./core/hux");
var store_IMPLEMENTATION_1 = require("./store_IMPLEMENTATION");
exports.hux = hux_1.getHux(store_IMPLEMENTATION_1.store);
