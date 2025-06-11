import axios from "axios";
import { REQUIRED_MESSAGE, REQUIRED_MESSAGE_FOR_META_DATA, FILE_UPLOAD_ENDPOINT, APP_AUTH_BASE_URL, REQUIRED_ERROR_MESSAGE_INVALID_EMAIL, API_ENDPOINTS, CHUNK_SIZE, BodyScanObjMetaData, FaceScanObjMetaData, requiredFaceScanMetaData } from "./constants.js";
import { addScanType, checkMetaDataValue, checkParameters, checkValues, fetchData, getFileChunks, getUrl, isValidEmail } from "./utils.js";
import Uppy from "@uppy/core";
import AwsS3Multipart from "@uppy/aws-s3-multipart";


interface SetDeviceInfo {
	detection?: string;
	model?: string;
	gyro: { alpha?: string; gamma?: string; beta?: string; timestamp?: string }[];
	scanId: string;
}

interface BodyScanUploadOptions {
	file: File;
	arrayMetaData: Partial<BodyScanObjMetaData>[];
	scanId: string;
	email: string;
	callBack?: (a: { eventName: string; message: string,scanId?:string,email?:string,objectKey?:string }) => void;
}
interface FaceScanUploadOptions {
	file: File;
	arrayMetaData: Partial<FaceScanObjMetaData>[];
	objectKey: string;
	email: string;
	contentType:string;
	callBack?: (a: { eventName: string; message: string,objectKey?:string,email?:string,scanId?:string }) => void;
}
interface UploadOptions{
	file: File;
	arrayMetaData: Partial<BodyScanObjMetaData>[] | Partial<FaceScanObjMetaData>[];
	scanId?: string;
	email: string;
	objectKey?:string;
	callBack?: (a: { eventName: string; message: string,scanId?:string,email?:string,objectKey?:string }) => void;
}

export default class FileUpload {
	#uppyIns: any;
	#accessKey: string;
	#stagingUrl: boolean;

	constructor(accessKey: string, stagingUrl = false) {
		this.#accessKey = accessKey;
		this.#stagingUrl = stagingUrl;
	}
	#uppyFileUploader({callBack,arrayMetaData,scanId,email,file,objectKey}:UploadOptions){
		return new Promise((resolve, reject) => {
			if (this.#uppyIns) {
				this.#uppyIns.close();
			}
			this.#uppyIns = new Uppy({ autoProceed: true });
			this.#uppyIns.use(AwsS3Multipart, {
				limit: 10,
				retryDelays: [0, 1000, 3000, 5000],
				companionUrl: getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl }),
				getChunkSize: () => CHUNK_SIZE,
				createMultipartUpload: (file: any) => {
					const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
					callBack?.({eventName:"uploading_start",message:`File ${file.name} will be divided into ${totalChunks} chunks`,scanId,email,objectKey})
					const ObjectKey = `${scanId || objectKey}.${file.extension}`;
					return fetchData({
						path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
						apiKey: this.#accessKey,
						stagingUrl: this.#stagingUrl,
						body: {
							objectKey:ObjectKey,
							contentType: file.type,
							objectMetadata: arrayMetaData,
						},
					});
				},
				completeMultipartUpload: (file: any, { uploadId, key, parts }: { uploadId: string | number; key: string | number; parts: any }) => {
				   callBack?.({eventName:"uploading_complete_start",message:`${parts.length} chunks of file, uploaded`,scanId,email,objectKey})	
					return fetchData({
						path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
						apiKey: this.#accessKey,
						stagingUrl: this.#stagingUrl,
						body: {
							uploadId,
							objectKey: key,
							parts,
							originalFileName: file.name,
						},
					}).then((response) => {
						callBack?.({eventName:"uploading_complete_end",message:`Multipart upload completed successfully`,scanId,email,objectKey})
						return response;  
					});
				},

				signPart: (file: any, partData: any) =>
					fetchData({
						path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
						stagingUrl: this.#stagingUrl,
						apiKey: this.#accessKey,
						body: {
							objectKey: partData.key,
							uploadId: partData.uploadId,
							partNumber: partData.partNumber,
						},
					}),
			});

			this.#uppyIns.addFile({
				source: "manual",
				name: file.name,
				type: file.type,
				data: file,
			});

			this.#uppyIns.on("upload-error", (file: any, error: any, response: any) => {
				if (error.isNetworkError) {
					this.#uppyIns.retryUpload(file.id);
				  }else{
					  reject(error);
				  }
			});
			this.#uppyIns.on("upload-success", () => {
				resolve({ message: "file uploaded successfully" });
			});
			this.#uppyIns.on("complete", (result: any) => {
				if (this.#uppyIns) {
					this.#uppyIns.close();
				}
			});
		});
	}
	async uploadFileFrontend({ file, arrayMetaData, scanId, email, callBack }: BodyScanUploadOptions) {
		if (!checkParameters(file, arrayMetaData, scanId, email)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		if (!isValidEmail(email.trim())) {
			throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
		}
		if (!checkMetaDataValue(arrayMetaData)) {
			throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
		}
		arrayMetaData = addScanType(arrayMetaData, scanId, email);
		return this.#uppyFileUploader({callBack,arrayMetaData,scanId,email,file})
		// return new Promise((resolve, reject) => {
		// 	if (this.#uppyIns) {
		// 		this.#uppyIns.close();
		// 	}
		// 	this.#uppyIns = new Uppy({ autoProceed: true });
		// 	this.#uppyIns.use(AwsS3Multipart, {
		// 		limit: 10,
		// 		retryDelays: [0, 1000, 3000, 5000],
		// 		companionUrl: getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl }),
		// 		getChunkSize: () => CHUNK_SIZE,
		// 		createMultipartUpload: (file: any) => {
		// 			const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
		// 			callBack?.({eventName:"uploading_start",message:`File ${file.name} will be divided into ${totalChunks} chunks`,scanId,email})
		// 			const objectKey = `${scanId}.${file.extension}`;
		// 			return fetchData({
		// 				path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
		// 				apiKey: this.#accessKey,
		// 				stagingUrl: this.#stagingUrl,
		// 				body: {
		// 					objectKey,
		// 					contentType: file.type,
		// 					objectMetadata: arrayMetaData,
		// 				},
		// 			});
		// 		},
		// 		completeMultipartUpload: (file: any, { uploadId, key, parts }: { uploadId: string | number; key: string | number; parts: any }) => {
		// 		   callBack?.({eventName:"uploading_complete_start",message:`${parts.length} chunks of file, uploaded`,scanId,email})	
		// 			return fetchData({
		// 				path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
		// 				apiKey: this.#accessKey,
		// 				stagingUrl: this.#stagingUrl,
		// 				body: {
		// 					uploadId,
		// 					objectKey: key,
		// 					parts,
		// 					originalFileName: file.name,
		// 				},
		// 			}).then((response) => {
		// 				callBack?.({eventName:"uploading_complete_end",message:`Multipart upload completed successfully`,scanId,email})
		// 				return response;  
		// 			});
		// 		},

		// 		signPart: (file: any, partData: any) =>
		// 			fetchData({
		// 				path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
		// 				stagingUrl: this.#stagingUrl,
		// 				apiKey: this.#accessKey,
		// 				body: {
		// 					objectKey: partData.key,
		// 					uploadId: partData.uploadId,
		// 					partNumber: partData.partNumber,
		// 				},
		// 			}),
		// 	});

		// 	this.#uppyIns.addFile({
		// 		source: "manual",
		// 		name: file.name,
		// 		type: file.type,
		// 		data: file,
		// 	});

		// 	this.#uppyIns.on("upload-error", (file: any, error: any, response: any) => {
		// 		if (error.isNetworkError) {
		// 			this.#uppyIns.retryUpload(file.id);
		// 		  }else{
		// 			  reject(error);
		// 		  }
		// 	});
		// 	this.#uppyIns.on("upload-success", () => {
		// 		resolve({ message: "file uploaded successfully" });
		// 	});
		// 	this.#uppyIns.on("complete", (result: any) => {
		// 		if (this.#uppyIns) {
		// 			this.#uppyIns.close();
		// 		}
		// 	});
		// });
	}
	
	async faceScanFileUploader({ file, arrayMetaData, objectKey, email, callBack }: FaceScanUploadOptions) {
		if (!checkParameters(file, arrayMetaData, objectKey, email)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		if (!isValidEmail(email.trim())) {
			throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
		}
		if (!checkValues(arrayMetaData,requiredFaceScanMetaData)) {
			throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
		}
		// arrayMetaData = addScanType(arrayMetaData, objectKey, email);
		arrayMetaData.push({email})
		return this.#uppyFileUploader({callBack,arrayMetaData,objectKey,email,file})
		// return new Promise((resolve, reject) => {
		// 	if (this.#uppyIns) {
		// 		this.#uppyIns.close();
		// 	}
		// 	this.#uppyIns = new Uppy({ autoProceed: true });
		// 	this.#uppyIns.use(AwsS3Multipart, {
		// 		limit: 10,
		// 		retryDelays: [0, 1000, 3000, 5000],
		// 		companionUrl: getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl }),
		// 		getChunkSize: () => CHUNK_SIZE,
		// 		createMultipartUpload: (file: any) => {
		// 			const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
		// 			callBack?.({eventName:"uploading_start",message:`File ${file.name} will be divided into ${totalChunks} chunks`,scanId,email})
		// 			const objectKey = `${scanId}.${file.extension}`;
		// 			return fetchData({
		// 				path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
		// 				apiKey: this.#accessKey,
		// 				stagingUrl: this.#stagingUrl,
		// 				body: {
		// 					objectKey,
		// 					contentType: file.type,
		// 					objectMetadata: arrayMetaData,
		// 				},
		// 			});
		// 		},
		// 		completeMultipartUpload: (file: any, { uploadId, key, parts }: { uploadId: string | number; key: string | number; parts: any }) => {
		// 		   callBack?.({eventName:"uploading_complete_start",message:`${parts.length} chunks of file, uploaded`,scanId,email})	
		// 			return fetchData({
		// 				path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
		// 				apiKey: this.#accessKey,
		// 				stagingUrl: this.#stagingUrl,
		// 				body: {
		// 					uploadId,
		// 					objectKey: key,
		// 					parts,
		// 					originalFileName: file.name,
		// 				},
		// 			}).then((response) => {
		// 				callBack?.({eventName:"uploading_complete_end",message:`Multipart upload completed successfully`,scanId,email})
		// 				return response;  
		// 			});
		// 		},

		// 		signPart: (file: any, partData: any) =>
		// 			fetchData({
		// 				path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
		// 				stagingUrl: this.#stagingUrl,
		// 				apiKey: this.#accessKey,
		// 				body: {
		// 					objectKey: partData.key,
		// 					uploadId: partData.uploadId,
		// 					partNumber: partData.partNumber,
		// 				},
		// 			}),
		// 	});

		// 	this.#uppyIns.addFile({
		// 		source: "manual",
		// 		name: file.name,
		// 		type: file.type,
		// 		data: file,
		// 	});

		// 	this.#uppyIns.on("upload-error", (file: any, error: any, response: any) => {
		// 		if (error.isNetworkError) {
		// 			this.#uppyIns.retryUpload(file.id);
		// 		  }else{
		// 			  reject(error);
		// 		  }
		// 	});
		// 	this.#uppyIns.on("upload-success", () => {
		// 		resolve({ message: "file uploaded successfully" });
		// 	});
		// 	this.#uppyIns.on("complete", (result: any) => {
		// 		if (this.#uppyIns) {
		// 			this.#uppyIns.close();
		// 		}
		// 	});
		// });
	}
	async uploadFile({ file, arrayMetaData, scanId, email }: BodyScanUploadOptions) {
		if (!checkParameters(file, arrayMetaData, scanId, email)) {
			throw new Error(REQUIRED_MESSAGE);
		}
		if (!isValidEmail(email.trim())) {
			throw new Error(REQUIRED_ERROR_MESSAGE_INVALID_EMAIL);
		}
		if (!checkMetaDataValue(arrayMetaData)) {
			throw new Error(REQUIRED_MESSAGE_FOR_META_DATA);
		}
		arrayMetaData = addScanType(arrayMetaData, scanId, email);
		return new Promise(async (resolve, reject) => {
			try {
				const res: { key: string; uploadId: string } = await fetchData({
					path: FILE_UPLOAD_ENDPOINT.UPLOAD_START,
					apiKey: this.#accessKey,
					stagingUrl: this.#stagingUrl,
					body: {
						objectKey: file.name,
						contentType: file.type,
						objectMetadata: arrayMetaData,
					},
					throwError: true,
				});
				const totalChunks = getFileChunks(file);
				const parts = [];
				for (let i = 0; i < totalChunks.length; i++) {
					const data: { url: string } = await fetchData({
						path: FILE_UPLOAD_ENDPOINT.UPLOAD_SIGN_PART,
						apiKey: this.#accessKey,
						stagingUrl: this.#stagingUrl,
						body: {
							objectKey: res?.key,
							uploadId: res?.uploadId,
							partNumber: i + 1,
						},
						throwError: true,
					});
					const val = await axios.put(data?.url, totalChunks[i], { headers: { "Content-Type": file.type, "X-Api-Key": this.#accessKey } });
					parts.push({ PartNumber: i + 1, ETag: val?.headers?.etag });
				}
				const completeValue = await fetchData({
					path: FILE_UPLOAD_ENDPOINT.UPLOAD_COMPLETE,
					apiKey: this.#accessKey,
					stagingUrl: this.#stagingUrl,
					body: {
						uploadId: res?.uploadId,
						objectKey: res?.key,
						parts,
						originalFileName: file.name,
					},
					throwError: true,
				});
				resolve({ message: "successfully uploaded", data: completeValue });
			} catch (error: any) {
				reject(error);
			}
		});
	}
	async setDeviceInfo(data: SetDeviceInfo) {
		const { scanId, ...rest } = data;
		if (checkParameters(scanId) === false) {
			throw new Error(REQUIRED_MESSAGE);
		}
		return axios.post(
			`${getUrl({ urlName: APP_AUTH_BASE_URL, stagingUrl: this.#stagingUrl })}${API_ENDPOINTS.DEVICE_INFO}/${scanId}`,
			{ device_info: { ...rest } },
			{
				headers: { "X-Api-Key": this.#accessKey },
			},
		);
	}
}
