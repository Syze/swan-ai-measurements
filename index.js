import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
export default class Swan {
  static accessKey;
  constructor(key) {
    if (key !== 9876543210) {
      throw new Error("wrong access key");
    }
    Swan.accessKey = key;
  }

  auth = new Auth(Swan.accessKey);

  custom = new Custom(Swan.accessKey);

  fileUpload = new FileUpload(Swan.accessKey);

  measurement = new Measurement(Swan.accessKey);

  poseDetection = new PoseDetection(Swan.accessKey);
}
