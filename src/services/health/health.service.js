"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.livenessOk = livenessOk;
exports.checkFirestore = checkFirestore;
exports.checkFirebaseAuth = checkFirebaseAuth;
exports.checkCeloRpc = checkCeloRpc;
exports.getHealthSnapshot = getHealthSnapshot;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const contractkit_1 = require("@celo/contractkit");
const blockchain_config_1 = require("@src/common/config/blockchain.config");
async function timeIt(fn) {
    const start = Date.now();
    try {
        const result = await fn();
        return { ms: Date.now() - start, result };
    }
    catch (error) {
        return { ms: Date.now() - start, error: error };
    }
}
function livenessOk() {
    // Si ce handler s'exécute, le process est vivant
    return true;
}
async function checkFirestore() {
    const r = await timeIt(async () => {
        await firebase_admin_1.default.firestore().doc(`health/_ping_${Date.now()}`).get();
        return true;
    });
    return {
        name: 'firestore',
        status: r.error ? 'down' : 'up',
        latencyMs: r.ms,
        error: r.error?.message,
    };
}
async function checkFirebaseAuth() {
    const r = await timeIt(async () => {
        try {
            await firebase_admin_1.default.auth().getUserByEmail('healthcheck@invalid.local');
        }
        catch {
            // On a une réponse: l'admin SDK fonctionne
        }
        return true;
    });
    return {
        name: 'firebase-auth',
        status: r.error ? 'down' : 'up',
        latencyMs: r.ms,
        error: r.error?.message,
    };
}
async function checkCeloRpc() {
    const kit = (0, contractkit_1.newKit)(blockchain_config_1.BLOCKCHAIN_CONFIG.CELO_RPC_URL);
    const r = await timeIt(async () => {
        const [blockNumber, chainId] = await Promise.all([
            kit.web3.eth.getBlockNumber(),
            kit.web3.eth.getChainId(),
        ]);
        return { blockNumber, chainId };
    });
    return {
        name: 'celo-rpc',
        status: r.error ? 'down' : 'up',
        latencyMs: r.ms,
        details: r.result,
        error: r.error?.message,
    };
}
async function getHealthSnapshot(opts) {
    const [fs, auth, celo] = await Promise.all([
        checkFirestore(),
        checkFirebaseAuth(),
        checkCeloRpc(),
    ]);
    const dep = [fs, auth, celo];
    const allUp = dep.every(d => d.status === 'up');
    const someDown = dep.some(d => d.status === 'down');
    const status = allUp ? 'up' : (someDown ? 'down' : 'degraded');
    const mu = process.memoryUsage();
    return {
        status,
        checkedAt: new Date().toISOString(),
        uptimeSec: Math.floor(process.uptime()),
        nodeVersion: process.version,
        memory: {
            rss: mu.rss,
            heapUsed: mu.heapUsed,
            heapTotal: mu.heapTotal,
        },
        dependencies: dep,
        version: opts?.version,
        commit: opts?.commit,
        env: opts?.env,
    };
}
