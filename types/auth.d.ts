export = Auth;
/**
 * Represents a Auth class for handling authentication operations.
 */
declare class Auth {
    /**
     * Constructs a new instance of the Auth class.
     * @param {string} accessKey - The access key used for authentication.
     */
    constructor(accessKey: string);
    /**
     * Register a new user.
     * @param {Object} params - The parameters for user registration.
     * @param {string} params.email - The email of the user.
     * @param {string} params.appVerifyUrl - The verification URL.
     * @param {string} [params.gender] - Optional. The gender of the user.
     * @param {string} [params.height] - Optional. The height of the user.
     * @param {string} params.username - Optional. The username of the user.
     * @returns {Promise} - The axios response promise.
     */
    registerUser({ email, appVerifyUrl, gender, height, username }: {
        email: string;
        appVerifyUrl: string;
        gender?: string | undefined;
        height?: string | undefined;
        username: string;
    }): Promise<any>;
    /**
     * Verify a user token.
     * @param {string} token
     * @returns {Promise}
     */
    verifyToken: (token: string, accessKey: any) => Promise<any>;
    /**
     * Add a user.
     * @param {Object} params
     * @param {string} params.scanId - The scan ID.
     * @param {string} params.email - The email of the user.
     * @param {string} params.name - The name of the user.
     * @param {string} params.height - The height of the user.
     * @param {string} params.gender - The gender of the user.
     * @param {boolean} [params.offsetMarketingConsent] - Optional. The marketing consent offset.
     * @returns {Promise} - The axios response promise.
     */
    addUser: ({ scanId, email, name, height, gender, offsetMarketingConsent }: {
        scanId: string;
        email: string;
        name: string;
        height: string;
        gender: string;
        offsetMarketingConsent?: boolean | undefined;
    }) => Promise<any>;
    /**
     * Get user details.
     * @param {string} email
     * @returns {Promise}
     */
    getUserDetail: (email: string) => Promise<any>;
    /**
     * Handle authentication via WebSocket.
     * @param {Object} params
     * @param {string} params.email - The email address of the user.
     * @param {string} params.scanId - The scan ID associated with the user.
     * @param {function} [params.onError] - Optional. Callback function to handle errors.
     * @param {function} [params.onSuccess] - Optional. Callback function to handle successful authentication.
     * @param {function} [params.onClose] - Optional. Callback function to handle the WebSocket close event.
     * @param {function} [params.onOpen] - Optional. Callback function to handle the WebSocket open event.
     */
    handleAuthSocket: ({ email, scanId, onError, onSuccess, onClose, onOpen }: {
        email: string;
        scanId: string;
        onError?: Function | undefined;
        onSuccess?: Function | undefined;
        onClose?: Function | undefined;
        onOpen?: Function | undefined;
    }) => void;
    #private;
}
