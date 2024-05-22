export default FileUpload;
/**
 * Class representing a file uploader using Uppy for multipart uploads.
 */
declare class FileUpload {
    /**
     * Constructs a new instance of the FileUpload class.
     * @param {string} accessKey - The access key used for authentication.
     */
    constructor(accessKey: string);
    /**
     * Asynchronously initializes the Uppy and AwsS3Multipart modules.
     * @private
     */
    private initializeModules;
    /**
     * Uploads a file with optional metadata and scan ID.
     * @param {Object} params - The parameters for file upload.
     * @param {File} params.file - The file to upload.
     * @param {Object} params.objMetaData - Optional. Metadata associated with the file.
     * @param {string} params.scanId - Optional. The ID of the scan.
     * @returns {Promise} - A promise that resolves when the file is uploaded successfully.
     * @throws {Error} - If required parameters are missing or metadata value is invalid.
     */
    uploadFile({ file, objMetaData, scanId }: {
        file: File;
        objMetaData: Object;
        scanId: string;
    }): Promise<any>;
    #private;
}
