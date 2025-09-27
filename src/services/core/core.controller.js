"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserWithWalletHandler = registerUserWithWalletHandler;
exports.transferCusdHandler = transferCusdHandler;
const core_service_1 = require("./core.service");
// Handler pour inscription + création de wallet
async function registerUserWithWalletHandler(req, res) {
    try {
        const result = await (0, core_service_1.registerUserWithWallet)(req.body);
        // res.json({ success: true, ...result });
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}
// Handler pour transfert cUSD
async function transferCusdHandler(req, res) {
    try {
        const { senderUserId, recipientPhone, amount } = req.body;
        const result = await (0, core_service_1.transferCusd)({
            senderUserId,
            recipientPhone,
            amount,
        });
        // res.json({ success: true, ...result });
        res.json({ success: true });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
}
