import express, { Application } from 'express';
import authMiddleware from './auth';
import protectedRoutes from './protectedRoutes';
import publicRoutes from './publicRoutes';
import 'dotenv/config';

const app: Application = express();

app.use(express.json());
app.use(publicRoutes);
app.use(authMiddleware);
app.use(protectedRoutes);

export default app;
