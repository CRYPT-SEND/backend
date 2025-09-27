"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("./health.controller");
const router = (0, express_1.Router)();
router.get('/liveness', health_controller_1.livenessHandler);
router.get('/readiness', health_controller_1.readinessHandler);
router.get('/', health_controller_1.healthHandler);
exports.default = router;
