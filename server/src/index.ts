import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'node:http';

import { createApp } from './app';
import { config } from './config';
import { startDemoReseed } from './services/demoReseed';
import { initSocket } from './services/socket';

const ALB_IDLE_TIMEOUT_MS = 60_000;
const KEEP_ALIVE_MARGIN_MS = 5_000;

const httpServer = createServer(createApp());

httpServer.keepAliveTimeout = ALB_IDLE_TIMEOUT_MS + KEEP_ALIVE_MARGIN_MS;
httpServer.headersTimeout = ALB_IDLE_TIMEOUT_MS + KEEP_ALIVE_MARGIN_MS * 2;

initSocket(httpServer);
startDemoReseed();

httpServer.listen(config.port, () => {
  console.log(`Server listening on port ${config.port} in ${config.nodeEnv} mode`);
});
