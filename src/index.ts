import Auth from "./auth.js";
import Custom from "./custom.js";
import { URLType } from "./enum.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";

class Swan {
  #accessKey: string;
  #urlType: URLType;
  auth: Auth;
  custom: Custom;
  fileUpload: FileUpload;
  measurement: Measurement;
  poseDetection: PoseDetection;
  tryOn: TryOn;

  constructor(accessKey: string, urlType = URLType.PROD) {
    this.#accessKey = accessKey;
    this.#urlType = urlType;
    this.auth = new Auth(this.#accessKey, this.#urlType);
    this.custom = new Custom(this.#accessKey, this.#urlType);
    this.fileUpload = new FileUpload(this.#accessKey, this.#urlType);
    this.measurement = new Measurement(this.#accessKey, this.#urlType);
    this.poseDetection = new PoseDetection(this.#accessKey, this.#urlType);
    this.tryOn = new TryOn(this.#accessKey, this.#urlType);
  }
}

export default Swan;
