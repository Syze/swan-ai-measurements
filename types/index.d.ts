export default Swan;
declare class Swan {
    constructor(accessKey: any);
    auth: Auth;
    custom: Custom;
    fileUpload: FileUpload;
    measurement: Measurement;
    poseDetection: PoseDetection;
    tryOn: TryOn;
    #private;
}
import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";
