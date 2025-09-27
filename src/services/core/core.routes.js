"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const core_controller_1 = require("./core.controller");
const router = (0, express_1.Router)();
// Route pour inscription + création de wallet
router.post('/register', core_controller_1.registerUserWithWalletHandler);
// Route pour transfert cUSD
router.post('/transfer', core_controller_1.transferCusdHandler);
exports.default = router;
