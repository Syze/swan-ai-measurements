import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";
declare class Swan {
    #private;
    auth: Auth;
    custom: Custom;
    fileUpload: FileUpload;
    measurement: Measurement;
    poseDetection: PoseDetection;
    tryOn: TryOn;
    constructor(accessKey: string);
}
export default Swan;
