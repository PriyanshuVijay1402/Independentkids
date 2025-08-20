require('@tensorflow/tfjs'); // or '@tensorflow/tfjs-node-gpu'

// services/localVisionClient.js
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

// Monkey patch for face-api.js to work with Node.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels() {
  const modelPath = path.join(__dirname, '../db/models');
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  console.log('[Face API] Models loaded from', modelPath);
}

module.exports = { faceapi, canvas, loadModels };
