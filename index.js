const Auth = require("./auth.js");
const Custom = require("./custom.js");
const FileUpload = require("./fileUpload.js");
const Measurement = require("./measurement.js");
const PoseDetection = require("./poseDetection.js");
const TryOn = require("./tryOn.js");
class Swan {
  #accessKey;
  constructor(accessKey) {
    this.#accessKey = accessKey;
  }
  auth = new Auth(this.#accessKey);

  custom = new Custom(this.#accessKey);

  fileUpload = new FileUpload(this.#accessKey);

  measurement = new Measurement(this.#accessKey);

  poseDetection = new PoseDetection(this.#accessKey);

  tryOn = new TryOn(this.#accessKey);
}

module.exports = Swan;
