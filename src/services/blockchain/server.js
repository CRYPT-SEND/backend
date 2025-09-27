"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
// import blockchainRoutes from './blockchain.routes';
dotenv_1.default.config({ path: './config/.env.development' });
const app = (0, express_1.default)();
const PORT = process.env.PORT_BLOCKCHAIN ?? '3002';
app.use(express_1.default.json());
// Routes blockchain (wallet, usdt, etc.)
// app.use('/api/wallet', blockchainRoutes);
app.get('/', (_req, res) => {
    res.send('Blockchain service is running!');
});
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Blockchain server listening on port ${PORT}`);
});
