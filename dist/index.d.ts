import Auth from "./auth";
import Custom from "./custom";
import FileUpload from "./fileUpload";
import Measurement from "./measurement";
import PoseDetection from "./poseDetection";
import TryOn from "./tryOn";
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
