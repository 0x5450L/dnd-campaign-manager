import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'node:http';

import { createApp } from './app';
import { config } from './config';
import { startDemoReseed } from './services/demoReseed';
import { initSocket } from './services/socket';

const httpServer = createServer(createApp());

initSocket(httpServer);
startDemoReseed();

httpServer.listen(config.port, () => {
  console.log(`Server listening on port ${config.port} in ${config.nodeEnv} mode`);
});
