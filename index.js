import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";
export default class Swan {
  auth = new Auth();

  custom = new Custom();

  fileUpload = new FileUpload();

  measurement = new Measurement();

  poseDetection = new PoseDetection();

  tryOn = new TryOn();
}
