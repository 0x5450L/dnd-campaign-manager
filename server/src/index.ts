import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'node:http';

import { createApp } from './app';
import { initSocket } from './services/socket';

const httpServer = createServer(createApp());

initSocket(httpServer);

httpServer.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
