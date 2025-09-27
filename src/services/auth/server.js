"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
dotenv_1.default.config({ path: './config/.env.development' });
const app = (0, express_1.default)();
const PORT = process.env.PORT_AUTH ?? '3001';
app.use(express_1.default.json());
// Routes d'authentification (inscription, connexion, etc.)
app.use('/api/auth', auth_routes_1.default);
app.get('/', (_req, res) => {
    res.send('Auth service is running!');
});
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 Auth server listening on port ${PORT}`);
});
