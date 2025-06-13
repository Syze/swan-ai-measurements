import { AxiosResponse } from "axios";
interface MeasurementRecommendation {
    shopDomain: string;
    scanId: string;
    productName: string;
}
interface Callbacks {
    onError?: (error: any) => void;
    onSuccess?: (data: any) => void;
    onClose?: () => void;
    onOpen?: () => void;
}
interface MeasurementSocketOptions extends Callbacks {
    scanId: string;
}
interface FaceScanSocketOptions extends Callbacks {
    faceScanId: string;
}
declare class Measurement {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    getMeasurementResult(scanId: string): Promise<AxiosResponse<any>>;
    getMeasurementRecommendation({ scanId, shopDomain, productName }: MeasurementRecommendation): Promise<AxiosResponse<any>>;
    handleMeasurementSocket(options: MeasurementSocketOptions): void;
    handlFaceScaneSocket(options: FaceScanSocketOptions): void;
}
export default Measurement;
