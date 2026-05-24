import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'
  , { extraHeaders: { Cookie: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjYmUxNDNiNS03MjgzLTQ2ZGYtOTE5ZC0zNDZmMWY0ZmYzZmYiLCJpYXQiOjE3Nzk2MjUzNjgsImV4cCI6MTc3OTcxMTc2OH0.5bHG88IWYP-sWfpNKVdmwKhMycVzdA0xn1KVVoMJH5U' } }
);

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('connect_error', (e) => { console.log('connect_error:', e.message); });

socket.on('disconnect', () => {
  console.log('disconnected from server');
});

socket.on('error', (error) => {
  console.error('socket error', error

  );
});