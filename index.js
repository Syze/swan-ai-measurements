import Auth from "./auth.js";
import Custom from "./custom.js";
import FileUpload from "./fileUpload.js";
import Measurement from "./measurement.js";
import PoseDetection from "./poseDetection.js";
import TryOn from "./tryOn.js";
/**
 * Represents a Swan object for handling various functionalities.
 * @class
 */
class Swan {
  /**
   * Constructs a new Swan object.
   * @constructor
   * @param {string} accessKey - The access key for authentication.
   */
  #accessKey;
  constructor(accessKey) {
    /**
     * The access key used for authentication.
     * @private
     * @type {string}
     */
    this.#accessKey = accessKey;
  }

  /**
   * Instance of the Auth class for authentication-related operations.
   * @type {Auth}
   */
  auth = new Auth(this.#accessKey);

  /**
   * Instance of the Custom class for custom operations.
   * @type {Custom}
   */
  custom = new Custom(this.#accessKey);

  /**
   * Instance of the FileUpload class for file upload operations.
   * @type {FileUpload}
   */
  fileUpload = new FileUpload(this.#accessKey);

  /**
   * Instance of the Measurement class for measurement-related operations.
   * @type {Measurement}
   */
  measurement = new Measurement(this.#accessKey);

  /**
   * Instance of the PoseDetection class for pose detection operations.
   * @type {PoseDetection}
   */
  poseDetection = new PoseDetection(this.#accessKey);

  /**
   * Instance of the TryOn class for try-on operations.
   * @type {TryOn}
   */
  tryOn = new TryOn(this.#accessKey);
}

export default Swan;
