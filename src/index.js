const express = require('express');
const publicRoutes = require('./publicRoutes');
const protectedRoutes = require('./protectedRoutes');
const authMiddleware = require('./auth');

const app = express();

app.use(express.json());
app.use(publicRoutes);
app.use(authMiddleware);
app.use(protectedRoutes);

module.exports = app;
