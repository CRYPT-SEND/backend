"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kit = void 0;
exports.checkCeloConnection = checkCeloConnection;
const contractkit_1 = require("@celo/contractkit");
const CELO_RPC_URL = process.env.CELO_RPC_URL ??
    'https://alfajores-forno.celo-testnet.org';
const kit = (0, contractkit_1.newKit)(CELO_RPC_URL);
exports.kit = kit;
async function checkCeloConnection() {
    try {
        const blockNumber = await kit.connection.web3.eth.getBlockNumber();
        // eslint-disable-next-line no-console
        console.log('✅ Connecté à Celo (Alfajores). Numéro de bloc actuel :', blockNumber);
        return blockNumber;
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('❌ Impossible de se connecter à Celo :', err.message);
        return null;
    }
}
// Appelle cette fonction au démarrage ou dans un endpoint de test
checkCeloConnection();
