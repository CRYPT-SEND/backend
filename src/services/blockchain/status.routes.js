"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const status_controller_1 = require("./status.controller");
const router = (0, express_1.Router)();
// GET /blockchain/status
router.get('/status', status_controller_1.getCeloStatus);
router.get('/status/stream', status_controller_1.streamCeloStatus);
exports.default = router;
