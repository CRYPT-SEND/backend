"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Endpoint de base
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
