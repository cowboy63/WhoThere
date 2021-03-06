const app = new Clarifai.App({
  apiKey: '00fe6ee1fb9a4d5e8688870b392ed496'
 });

 let model = app.models.get('People');

let videoWidth, videoHeight;

// whether streaming video from the camera.
let streaming = false;

let video = document.getElementById('video');
let canvasOutput = document.getElementById('canvasOutput');
let canvasOutputCtx = canvasOutput.getContext('2d');
let stream = null;

let detectFace = document.getElementById('face');

function startCamera() {
  if (streaming) return;
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(function(s) {
    stream = s;
    video.srcObject = s;
    video.play();
  })
    .catch(function(err) {
    console.log("An error occured! " + err);
  });

  video.addEventListener("canplay", function(ev){
    if (!streaming) {
      videoWidth = video.videoWidth;
      videoHeight = video.videoHeight;
      video.setAttribute("width", videoWidth);
      video.setAttribute("height", videoHeight);
      canvasOutput.width = videoWidth;
      canvasOutput.height = videoHeight;
      streaming = true;
    }
    startVideoProcessing();
  }, false);
}

let faceClassifier = null;

let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;

let canvasInput = null;
let canvasInputCtx = null;

let canvasBuffer = null;
let canvasBufferCtx = null;

var lastPersonName = "";
var frameCount = 100;

function startVideoProcessing() {
  if (!streaming) { console.warn("Please startup your webcam"); return; }
  stopVideoProcessing();
  canvasInput = document.createElement('canvas');
  canvasInput.width = videoWidth;
  canvasInput.height = videoHeight;
  canvasInputCtx = canvasInput.getContext('2d');
  
  canvasBuffer = document.createElement('canvas');
  canvasBuffer.width = videoWidth;
  canvasBuffer.height = videoHeight;
  canvasBufferCtx = canvasBuffer.getContext('2d');
  
  srcMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
  grayMat = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC1);
  
  faceClassifier = new cv.CascadeClassifier();
  faceClassifier.load('haarcascade_frontalface_default.xml');
  
  requestAnimationFrame(processVideo);
}

function processVideo() {
  frameCount += 1;
  stats.begin();
  canvasInputCtx.drawImage(video, 0, 0, videoWidth, videoHeight);
  let imageData = canvasInputCtx.getImageData(0, 0, videoWidth, videoHeight);
  srcMat.data.set(imageData.data);
  cv.cvtColor(srcMat, grayMat, cv.COLOR_RGBA2GRAY);
  let faces = [];
  let size;
  let faceVect = new cv.RectVector();
  let faceMat = new cv.Mat();
  cv.pyrDown(grayMat, faceMat);
  cv.pyrDown(faceMat, faceMat);
  size = faceMat.size();
  faceClassifier.detectMultiScale(faceMat, faceVect);
  for (let i = 0; i < faceVect.size(); i++) {
    let face = faceVect.get(i);
    if(frameCount > 60){
      frameCount = 0;

     // var canvas = document.getElementById('canvasOutput');
      //var image = canvasOutput.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
     // var ctx = canvas.getContext('2d');
     // let imgData = ctx.getImageData(face.x, face.y, face.width, face.height);
      //console.log(imgData);

      //app.models.predict(model, imgData);
      

      //window.location.href=image;
      var link = document.createElement('a');
      link.href = canvasOutput.toDataURL();
      app.models.predict("People", {base64 : link.href.substring(22)}).then(
        function(response){
          var name = response.rawData.outputs[0].data.concepts[0].name;
          var prediction_value = response.rawData.outputs[0].data.concepts[0].value;
          console.log(name + " :" + prediction_value);
          if(prediction_value >= 0.5 && !(name === lastPersonName)){
            lastPersonName = name;
            console.log("SEND MESSAGE : "+name);
          }
        },
        function(err){

        }
      );
    }
    if(lastPersonName != null){
    document.getElementById("afterN").innerHTML = lastPersonName;
    }
    //faces.push(new cv.putText(srcMat, lastPersonName, {x: face.x, y: face.y}, cv.FONT_HERSHEY_SIMPLEX, 1.0, [0,255,0,255]));
    faces.push(new cv.Rect(face.x, face.y, face.width, face.height));
  }
  faceMat.delete();
  faceVect.delete();
  canvasOutputCtx.drawImage(canvasInput, 0, 0, videoWidth, videoHeight);
  drawResults(canvasOutputCtx, faces, 'green', size);
  stats.end();
  requestAnimationFrame(processVideo);
}

function drawResults(ctx, results, color, size) {
  for (let i = 0; i < results.length; ++i) {
    let rect = results[i];
    let xRatio = videoWidth/size.width;
    let yRatio = videoHeight/size.height;
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.strokeRect(rect.x*xRatio, rect.y*yRatio, rect.width*xRatio, rect.height*yRatio);
  }
}

function stopVideoProcessing() {
  if (src != null && !src.isDeleted()) src.delete();
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
}

function stopCamera() {
  if (!streaming) return;
  stopVideoProcessing();
  document.getElementById("canvasOutput").getContext("2d").clearRect(0, 0, width, height);
  video.pause();
  video.srcObject=null;
  stream.getVideoTracks()[0].stop();
  streaming = false;
}

function initUI() {
  stats = new Stats();
  stats.showPanel(0);
  document.getElementById('container').appendChild(stats.dom);
}

function opencvIsReady() {
  console.log('OpenCV.js is ready');
  initUI();
  startCamera();
}