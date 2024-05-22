import Auth from "./auth";
import Custom from "./custom";
import FileUpload from "./fileUpload";
import Measurement from "./measurement";
import PoseDetection from "./poseDetection";
import TryOn from "./tryOn";

class Swan {
  #accessKey: string;
  auth: Auth;
  custom: Custom;
  fileUpload: FileUpload;
  measurement: Measurement;
  poseDetection: PoseDetection;
  tryOn: TryOn;

  constructor(accessKey: string) {
    this.#accessKey = accessKey;

    this.auth = new Auth(this.#accessKey);
    this.custom = new Custom(this.#accessKey);
    this.fileUpload = new FileUpload(this.#accessKey);
    this.measurement = new Measurement(this.#accessKey);
    this.poseDetection = new PoseDetection(this.#accessKey);
    this.tryOn = new TryOn(this.#accessKey);
  }
}

export default Swan;
