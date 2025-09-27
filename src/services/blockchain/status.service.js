"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetworkStatus = getNetworkStatus;
const contractkit_1 = require("@celo/contractkit");
const blockchain_config_1 = require("@src/common/config/blockchain.config");
/**
 * Récupère l’état courant du réseau Celo via le nœud configuré.
 * Les erreurs par propriété sont collectées et renvoyées sans faire échouer l’ensemble.
 */
async function getNetworkStatus() {
    const kit = (0, contractkit_1.newKit)(blockchain_config_1.BLOCKCHAIN_CONFIG.CELO_RPC_URL);
    const web3 = kit.connection.web3;
    const errors = {};
    // Vérifie la connexion basique
    try {
        await web3.eth.getBlockNumber();
    }
    catch (err) {
        return {
            connected: false,
            errors: { connection: err.message },
            checkedAt: new Date().toISOString(),
        };
    }
    const status = {
        connected: true,
        checkedAt: new Date().toISOString(),
    };
    await Promise.all([
        (async () => {
            try {
                status.chainId = await web3.eth.getChainId();
            }
            catch (e) {
                errors.chainId = e.message;
            }
        })(),
        (async () => {
            try {
                status.networkId = await web3.eth.net.getId();
            }
            catch (e) {
                errors.networkId = e.message;
            }
        })(),
        (async () => {
            try {
                status.gasPriceWei = await web3.eth.getGasPrice();
            }
            catch (e) {
                errors.gasPriceWei = e.message;
            }
        })(),
        (async () => {
            try {
                const syncing = await web3.eth.isSyncing();
                status.syncing = typeof syncing === 'boolean'
                    ? syncing
                    : syncing;
            }
            catch (e) {
                errors.syncing = e.message;
            }
        })(),
        (async () => {
            try {
                status.nodeInfo = await web3.eth.getNodeInfo();
            }
            catch (e) {
                errors.nodeInfo = e.message;
            }
        })(),
        (async () => {
            try {
                status.peerCount = await web3.eth.net.getPeerCount();
            }
            catch (e) {
                errors.peerCount = e.message;
            }
        })(),
        (async () => {
            try {
                status.epochSize = await kit.getEpochSize();
            }
            catch (e) {
                errors.epochSize = e.message;
            }
        })(),
    ]);
    // Bloc séparé pour le dernier bloc (dépend de getBlockNumber + getBlock)
    try {
        const latest = await web3.eth.getBlockNumber();
        status.latestBlockNumber = latest;
        try {
            const block = await web3.eth.getBlock(latest);
            status.latestBlockTimestamp = typeof block?.timestamp === 'string'
                ? parseInt(block.timestamp, 10)
                : block?.timestamp;
        }
        catch (e) {
            errors.latestBlock = e.message;
        }
    }
    catch (e) {
        errors.latestBlockNumber = e.message;
    }
    if (Object.keys(errors).length) {
        status.errors = errors;
    }
    return status;
}
