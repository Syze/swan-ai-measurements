import { AxiosResponse } from "axios";
interface TryOnSocketOptions {
    shopDomain: string;
    scanId: string;
    productName: string;
    onError?: (error: any) => void;
    onSuccess?: (data: any) => void;
    onClose?: () => void;
    onOpen?: () => void;
}
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
}
declare class Measurement {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    getMeasurementResult(scanId: string): Promise<AxiosResponse<any>>;
    getMeasurementRecommendation({ scanId, shopDomain, productName }: MeasurementRecommendation): Promise<AxiosResponse<any>>;
    getTryOnMeasurements({ scanId, shopDomain, productName }: TryOnSocketOptions): Promise<AxiosResponse<any>>;
    handleTryOnSocket(options: TryOnSocketOptions): void;
    handleMeasurementSocket(options: MeasurementSocketOptions): void;
}
export default Measurement;
