import Auth from "./auth.js";
import Custom from "./custom.js";
import { URLType } from "./enum.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";

class Swan {
  #accessKey?: string;
  #urlType: URLType;
  #token?: string;
  auth: Auth;
  custom: Custom;
  fileUpload: FileUpload;
  measurement: Measurement;
  poseDetection: PoseDetection;
  tryOn: TryOn;

  constructor(accessKey?: string, urlType = URLType.PROD, token?: string) {
    this.#accessKey = accessKey;
    this.#urlType = urlType;
    this.#token = token;
    this.auth = new Auth(this.#accessKey, this.#urlType, this.#token);
    this.custom = new Custom(this.#accessKey, this.#urlType, this.#token);
    this.fileUpload = new FileUpload(this.#accessKey, this.#urlType, this.#token);
    this.measurement = new Measurement(this.#accessKey, this.#urlType, this.#token);
    this.poseDetection = new PoseDetection(this.#accessKey, this.#urlType, this.#token);
    this.tryOn = new TryOn(this.#accessKey, this.#urlType, this.#token);
  }
}

export default Swan;
