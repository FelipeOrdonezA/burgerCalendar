import backendModule from '../../backend/dist/utils/app.js';

// Vercel routes this explicit two-segment API pattern before the generic
// catch-all. Express still receives the original URL and owns the endpoint.
export default backendModule.default || backendModule;
