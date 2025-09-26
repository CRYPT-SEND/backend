"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Paths_1 = __importDefault(require("@src/common/constants/Paths"));
const UserRoutes_1 = __importDefault(require("./UserRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const superAdminRoutes_1 = __importDefault(require("./superAdminRoutes"));
//import { ad } from 'vitest/dist/chunks/reporters.d.BFLkQcL6';
/******************************************************************************
                                Setup
******************************************************************************/
const apiRouter = (0, express_1.Router)();
// ** Add UserRouter ** //
// Init router
const userRouter = (0, express_1.Router)();
// Get all users
userRouter.get(Paths_1.default.Users.Get, UserRoutes_1.default.getAll);
userRouter.post(Paths_1.default.Users.Add, UserRoutes_1.default.add);
userRouter.put(Paths_1.default.Users.Update, UserRoutes_1.default.update);
userRouter.delete(Paths_1.default.Users.Delete, UserRoutes_1.default.delete);
// Add UserRouter
apiRouter.use(Paths_1.default.Users.Base, userRouter);
// Add Auth routes under /auth
//apiRouter.use('/auth', authRoutes);
// Add Admin routes under /admin
apiRouter.use('/admin', adminRoutes_1.default);
// Add superAdmin routes under /superAdmin
apiRouter.use('/superAdmin', superAdminRoutes_1.default);
/******************************************************************************
                                Export default
******************************************************************************/
exports.default = apiRouter;
