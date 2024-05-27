import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";

class Swan {
  #accessKey: string;
  #stagingUrl: boolean;
  auth: Auth;
  custom: Custom;
  fileUpload: FileUpload;
  measurement: Measurement;
  poseDetection: PoseDetection;
  tryOn: TryOn;

  constructor(accessKey: string, prod = false) {
    this.#accessKey = accessKey;
    this.#stagingUrl = prod;
    this.auth = new Auth(this.#accessKey, this.#stagingUrl);
    this.custom = new Custom(this.#accessKey, this.#stagingUrl);
    this.fileUpload = new FileUpload(this.#accessKey, this.#stagingUrl);
    this.measurement = new Measurement(this.#accessKey, this.#stagingUrl);
    this.poseDetection = new PoseDetection(this.#accessKey, this.#stagingUrl);
    this.tryOn = new TryOn(this.#accessKey, this.#stagingUrl);
  }
}

export default Swan;
