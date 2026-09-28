import backendModule from '../../backend/dist/utils/app.js';

// Express receives the original URL and owns the endpoint.
export default backendModule.default || backendModule;
