'use strict';

const params = (new URL(document.location)).searchParams;
const SECRET = params.get('secret');
const video = document.getElementsByTagName('video')[0];
const canvas = document.getElementsByTagName('canvas')[0];

const wait = async (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
};

const main = async () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const canvasContext = canvas.getContext('2d');
  canvasContext.drawImage(video, 0, 0);
  const type = 'image/png';
  const bin = atob(canvas.toDataURL(type).replace(/^.*,/, ''));
  const buffer = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }
  const blob = new Blob([buffer.buffer], { type });

  const data = new FormData();
  data.append('secret', SECRET);
  data.append('frame', blob, 'frame.png');

  try {
    await axios.post(
      '/frame',
      data,
      {
        headers: {
          'content-type': 'multipart/form-data'
        }
      }
    );
  } catch (err) {
    console.error(err);
    return;
  }

  await wait(250);
  await main();
};
main();

navigator.mediaDevices
  .getDisplayMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => console.error('ERR[getUserMedia]', err));
