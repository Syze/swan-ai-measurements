export = Swan;
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
import Auth = require("./auth.js");
import Custom = require("./custom.js");
import FileUpload = require("./fileUpload.js");
import Measurement = require("./measurement.js");
import PoseDetection = require("./poseDetection.js");
import TryOn = require("./tryOn.js");
