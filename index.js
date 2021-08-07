'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const formData = require('express-form-data');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;
const SECRET_HOST = process.env.SECRET_HOST || 'secretHost';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(formData.parse());

io.on('connection', (socket) => {
  console.log('connected', socket.id);
});

app.post('/frame', (req, res) => {
  if (!req.body.secret || !req.files.frame) {
    res.status(400).send('plz set secret and frame');
    return;
  }

  if (req.body.secret !== SECRET_HOST) {
    res.status(401).send('secret is invalid');
    return;
  }

  io.emit('render', `data:image/png;base64,${fs.readFileSync(req.files.frame.path, { encoding: 'base64' })}`);
  res.send('received');
});

http.listen(PORT, () => {
  console.log('server listening. Port: ' + PORT);
});
