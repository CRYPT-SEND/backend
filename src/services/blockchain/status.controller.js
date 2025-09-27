"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCeloStatus = getCeloStatus;
exports.streamCeloStatus = streamCeloStatus;
const status_service_1 = require("./status.service");
async function getCeloStatus(_req, res) {
    try {
        const status = await (0, status_service_1.getNetworkStatus)();
        const httpCode = status.connected ? 200 : 503;
        res.status(httpCode).json(status);
    }
    catch (err) {
        res.status(500).json({
            connected: false,
            error: err.message,
        });
    }
}
// Diffusion continue via Server-Sent Events (SSE)
function streamCeloStatus(req, res) {
    // Entêtes SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Autoriser CORS simple si besoin (peut être géré globalement ailleurs)
    res.setHeader('Access-Control-Allow-Origin', '*');
    const sendEvent = async () => {
        try {
            const status = await (0, status_service_1.getNetworkStatus)();
            res.write(`data: ${JSON.stringify(status)}\n\n`);
        }
        catch (e) {
            const err = { connected: false, error: e.message };
            res.write(`data: ${JSON.stringify(err)}\n\n`);
        }
    };
    // Envoi initial immédiat
    void sendEvent();
    // Puis rafraîchissement périodique (par défaut 5s)
    const intervalMs = (() => {
        const raw = req.query.interval;
        const parsed = raw ? Number(raw) : NaN;
        return Number.isFinite(parsed) && parsed >= 1000 ? parsed : 5000;
    })();
    const interval = setInterval(sendEvent, intervalMs);
    // Nettoyage à la fermeture de la connexion
    req.on('close', () => {
        clearInterval(interval);
    });
}
