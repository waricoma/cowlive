'use strict';

const socket = io();
const params = (new URL(document.location)).searchParams;
const SECRET = params.get('secret');
const video = document.getElementsByTagName('video')[0];
const canvas = document.getElementsByTagName('canvas')[0];

let interval;
let streamEnabled = false;

socket.on('connect', () => {
  socket.emit('auth', SECRET);

  interval = setInterval(() => {
    if (!streamEnabled) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const canvasContext = canvas.getContext('2d');
    canvasContext.drawImage(video, 0, 0);

    socket.emit('frame', canvas.toDataURL('image/png'));
  }, 16);
});

socket.on('auth_result', (authResult) => {
  console.log('auth_result', authResult);
});

socket.on('disconnect', () => {
  clearInterval(interval);
});

navigator.mediaDevices
  .getDisplayMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    streamEnabled = true;
  })
  .catch((err) => console.error('ERR[getUserMedia]', err));
