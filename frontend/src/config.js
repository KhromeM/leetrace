const isDevelopment = import.meta.env.DEV;

export const BACKEND_URL = isDevelopment 
  ? 'http://localhost:3000'
  : 'https://backend-bitter-log-4782.fly.dev';

export const BACKEND_WS_URL = isDevelopment
  ? 'ws://localhost:3000'
  : 'wss://backend-bitter-log-4782.fly.dev';