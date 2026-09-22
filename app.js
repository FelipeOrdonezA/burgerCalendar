import express from 'express';
import backendModule from './backend/dist/utils/app.js';

const app = express();
app.use(backendModule.default || backendModule);
export default app;
