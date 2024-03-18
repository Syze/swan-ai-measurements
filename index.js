import { FILE_UPLOAD_KEY } from "./constants.js";
import { addUser, getUserDetail, registerUser, verifyUser } from "./auth.js";
import uploadFile from "./fileUpload.js";
export default class Swan {
  constructor(key) {
    if (key !== 9876543210) {
      throw new Error("wrong access key");
    }
    this.accessKey = key;
  }
  registerUser({ email, appVerifyUrl, gender, height, username = "" }) {
    return registerUser({ email, appVerifyUrl, gender, height, username, accessKey: this.accessKey });
  }

  verifyUser(token) {
    return verifyUser(token, this.accessKey);
  }

  addUser({ scanId, email, name = "", height, gender }) {
    return addUser({ scanId, email, name, height, gender, accessKey: this.accessKey });
  }

  getUserDetail(email) {
    return getUserDetail(email, this.accessKey);
  }

  uploadFile({ file, objMetaData, scanId }) {
    return uploadFile({ file, objMetaData, scanId, accessKey: this.accessKey });
  }
}
