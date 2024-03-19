import { addUser, getUserDetail, registerUser, verifyToken } from "./auth.js";
import { getCustomCustomerConfig } from "./custom.js";
import uploadFile from "./fileUpload.js";
export default class Swan {
  constructor(key) {
    if (key !== 9876543210) {
      throw new Error("wrong access key");
    }
    this.accessKey = key;
  }

  registerUser({ email, appVerifyUrl, gender, height, username }) {
    return registerUser({ email, appVerifyUrl, gender, height, username, accessKey: this.accessKey });
  }

  verifyToken(token) {
    return verifyToken(token, this.accessKey);
  }

  addUser({ scanId, email, name, height, gender, offsetMarketingConsent }) {
    return addUser({ scanId, email, name, height, gender, offsetMarketingConsent, accessKey: this.accessKey });
  }

  getUserDetail(email) {
    return getUserDetail(email, this.accessKey);
  }

  uploadFile({ file, objMetaData, scanId }) {
    return uploadFile({ file, objMetaData, scanId, accessKey: this.accessKey });
  }

  getModelUrl(id) {
    return getModelUrl(id, this.accessKey);
  }

  getCustomCustomerConfig(storeUrl) {
    return getCustomCustomerConfig(storeUrl, this.accessKey);
  }

  getMeasurementStatus(scanId) {
    return getMeasurementStatus(scanId, this.accessKey);
  }

  getTryOnMeasurements({ scanId, shopDomain, productName }) {
    return getTryOnMeasurements({ scanId, shopDomain, productName, accessKey: this.accessKey });
  }

  handleTryOnSocket({ shopDomain, scanId, productName, onError, onSuccess, onClose, onOpen }) {
    return handleTryOnSocket({
      shopDomain,
      scanId,
      productName,
      accessKey: this.accessKey,
      onError,
      onSuccess,
      onClose,
      onOpen,
    });
  }

  handleMeasurementSocket({ scanId, onError, onSuccess, onClose, onOpen }) {
    return handleMeasurementSocket({ scanId, accessKey: this.accessKey, onError, onSuccess, onClose, onOpen });
  }

  handleAuthSocket({ email, scanId, onError, onSuccess, onClose, onOpen }) {
    return handleAuthSocket({ email, scanId, accessKey: this.accessKey, onError, onSuccess, onClose, onOpen });
  }
}
