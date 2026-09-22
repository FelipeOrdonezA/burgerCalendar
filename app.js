const express = require('express');
const backendModule = require('./backend/dist/utils/app');

const app = express();
app.use(backendModule.default || backendModule);
module.exports = app;
