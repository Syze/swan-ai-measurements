const Auth = require("./auth.js");
const Custom = require("./custom.js");
const FileUpload = require("./fileUpload.js");
const Measurement = require("./measurement.js");
const PoseDetection = require("./poseDetection.js");
const TryOn = require("./tryOn.js");
class Swan {
  auth = new Auth();

  custom = new Custom();

  fileUpload = new FileUpload();

  measurement = new Measurement();

  poseDetection = new PoseDetection();

  tryOn = new TryOn();
}

module.exports = Swan;
