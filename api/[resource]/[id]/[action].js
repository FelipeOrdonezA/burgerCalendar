import backendModule from '../../../backend/dist/utils/app.js';

// Covers nested actions such as /api/calendars/:id/approve and /reopen.
export default backendModule.default || backendModule;
