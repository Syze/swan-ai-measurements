import { AxiosResponse } from "axios";
interface MeasurementRecommendation {
    shopDomain: string;
    scanId: string;
    productName: string;
}
interface MeasurementSocketOptions {
    scanId: string;
    onError?: (error: any) => void;
    onSuccess?: (data: any) => void;
    onClose?: () => void;
    onOpen?: () => void;
    isFallback?: boolean;
}
declare class Measurement {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    getMeasurementResult(scanId: string): Promise<AxiosResponse<any>>;
    getMeasurementRecommendation({ scanId, shopDomain, productName }: MeasurementRecommendation): Promise<AxiosResponse<any>>;
    handleMeasurementSocket(options: MeasurementSocketOptions): void;
}
export default Measurement;
