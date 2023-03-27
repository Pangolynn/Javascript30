const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
  // returns a promise
  navigator.mediaDevices.getUserMedia({ video: true, audio: false})
    .then(localMediaStream => {
      // used to have to convert the localMediaStream object to a url
      // but now we can directly set it to the video src object
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch(err => {
      console.error("Camera Access Denied");
    });

}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;

  //the canvas needs to be the same size as the video
  canvas.width = width;
  canvas.height = height;

  // paints video to canvas every 16ms
  // we return so that we can stop the painting if we want
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // change the pixels
    //pixels = redEffect(pixels);
    //pixels = rgbSplit(pixels);
    pixels = greenScreen(pixels);
    // put the pixels back
    ctx.putImageData(pixels, 0, 0);
  }, 16);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play(); //plays the sound snap

  // take data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}" alt="Beautiful" />`;
  strip.insertBefore(link, strip.firstChild);

}

function redEffect(pixels) {
  for(let i =0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i] + 100; // red
    pixels.data[i + 1] = pixels.data[i+1] - 50; // Green
    pixels.data[i + 2] = pixels.data[i+2] * 0.5; // Blue
  }

  return pixels;
}

function rgbSplit(pixels) {
  for(let i = 0; i < pixels.data.length; i+=4) {
    pixels.data[i - 150] = pixels.data[i]; // red
    pixels.data[i + 100] = pixels.data[i+1]; // Green
    pixels.data[i + 150] = pixels.data[i+2]; // Blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);
