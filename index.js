'use strict';

const path = require('path');
const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;
const SECRET_HOST = process.env.SECRET_HOST || 'secretHost';

app.use(express.static(path.join(__dirname, 'public')));

let host;
let clients = {};

io.on('connection', (socket) => {
  clients[socket.id] = socket;

  socket.on('auth', (secretHost) => {
    if (secretHost !== SECRET_HOST) {
      socket.emit('auth_result', 'failed');
      return;
    }

    socket.emit('auth_result', 'success');
    host = socket;
  });

  socket.on('frame', (frame) => {
    if (!host) {
      return;
    }

    if (socket.id !== host.id) {
      return;
    }

    io.emit('render', frame);
  });

  socket.on('disconnect', () => {
    if (host) {
      if (socket.id === host.id) {
        host = null;
      }
    }

    delete clients[socket.id];
  });
});

http.listen(PORT, () => {
  console.log('server listening. Port: ' + PORT);
});
