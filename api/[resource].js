import backendModule from '../backend/dist/utils/app.js';

// Routes one-segment API requests, such as /api/employees and /api/health,
// to the shared Express application.
export default backendModule.default || backendModule;
