export = Custom;
/**
 * Represents a Custom class for handling custom operations.
 */
declare class Custom {
    /**
     * Constructs a new instance of the Custom class.
     * @param {string} accessKey - The access key used for authentication.
     */
    constructor(accessKey: string);
    /**
     * Retrieves custom customer configuration based on the store URL.
     * @param {string} store_url - The URL of the store.
     * @returns {Promise} - A promise that resolves with the custom customer configuration.
     * @throws {Error} - If required parameters are missing.
     */
    getCustomCustomerConfig: (store_url: string) => Promise<any>;
    /**
     * Retrieves the model URL based on the model ID.
     * @param {string} id - The ID of the model.
     * @returns {Promise} - A promise that resolves with the model URL.
     * @throws {Error} - If required parameters are missing.
     */
    getModelUrl: (id: string) => Promise<any>;
    #private;
}
