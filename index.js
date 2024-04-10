import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
export default class Swan {
  constructor(key) {
    if (key !== 9876543210) {
      throw new Error("wrong access key");
    }
    this.accessKey = key;
  }

  auth = new Auth();

  custom = new Custom();

  fileUpload = new FileUpload();

  measurement = new Measurement();

  poseDetection = new PoseDetection();
}
