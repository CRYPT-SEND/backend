"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.livenessHandler = livenessHandler;
exports.readinessHandler = readinessHandler;
exports.healthHandler = healthHandler;
const health_service_1 = require("./health.service");
function livenessHandler(_req, res) {
    return res.status((0, health_service_1.livenessOk)() ? 200 : 500).json({ status: 'ok' });
}
async function readinessHandler(_req, res) {
    const snap = await (0, health_service_1.getHealthSnapshot)({
        version: process.env.APP_VERSION,
        commit: process.env.GIT_COMMIT,
        env: process.env.NODE_ENV,
    });
    const ready = snap.status === 'up';
    return res.status(ready ? 200 : 503).json(snap);
}
async function healthHandler(_req, res) {
    const snap = await (0, health_service_1.getHealthSnapshot)({
        version: process.env.APP_VERSION,
        commit: process.env.GIT_COMMIT,
        env: process.env.NODE_ENV,
    });
    const code = snap.status === 'down' ? 503 : 200;
    return res.status(code).json(snap);
}
