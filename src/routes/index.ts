import { Router } from 'express';

import Paths from '@src/common/constants/Paths';
import UserRoutes from './UserRoutes';
// import principalRoute from './principalRoute';
import authRoutes from '../services/auth/auth.routes';
import adminRoutes from './adminRoutes';
import superAdminRoutes from './superAdminRoutes';
import { ad } from 'vitest/dist/chunks/reporters.d.BFLkQcL6';


/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();


// ** Add UserRouter ** //

// Init router
const userRouter = Router();

// Get all users
userRouter.get(Paths.Users.Get, UserRoutes.getAll);
userRouter.post(Paths.Users.Add, UserRoutes.add);
userRouter.put(Paths.Users.Update, UserRoutes.update);
userRouter.delete(Paths.Users.Delete, UserRoutes.delete);

// Add UserRouter
apiRouter.use(Paths.Users.Base, userRouter);

// Add Auth routes under /auth
apiRouter.use('/auth', authRoutes);

// Add Admin routes under /admin
apiRouter.use('/admin', adminRoutes);
// Add superAdmin routes under /superAdmin
apiRouter.use('/superAdmin', superAdminRoutes);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
