import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";
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

export default Swan;
