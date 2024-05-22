import Auth from "./auth";
import Custom from "./custom";
import FileUpload from "./fileUpload";
import Measurement from "./measurement";
import PoseDetection from "./poseDetection";
import TryOn from "./tryOn";

export default class Swan {
  constructor(accessKey: string);

  auth: Auth;
  custom: Custom;
  fileUpload: FileUpload;
  measurement: Measurement;
  poseDetection: PoseDetection;
  tryOn: TryOn;

  #private;
}
