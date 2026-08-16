import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'node:http';

import { createApp } from './app';
import { config } from './config';
import { initSocket } from './services/socket';

const httpServer = createServer(createApp());

initSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Server listening on port ${config.port} in ${config.nodeEnv} mode`);
});
