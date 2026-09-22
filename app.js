// Vercel's Express entry point. The build compiles backend/src into backend/dist.
const express = require("express");
const backend = require("./backend/dist/utils/app").default;

const app = express();
app.use(backend);
module.exports = app;
