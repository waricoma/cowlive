'use strict';

const socket = io();
const img = document.getElementsByTagName('img')[0];

socket.on('render', (frame) => {
  img.src = frame;
});
