// Shared state between different game components
export const activeConnections = new Map();
export let matchmakingPool = new Set();
export const alreadyPaired = new Set();

// Constants
export const MAX_RATING_DIFF = 300;
export const MAX_WAIT_TIME = 60000;
export const MATCHMAKING_INTERVAL = 2000;