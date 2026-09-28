import { AxiosResponse } from "axios";
import { URLType } from "./enum.js";
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
    onPreopen?: () => void;
}
interface MeasurementSocketOptions extends Callbacks {
    scanId: string;
}
interface FaceScanSocketOptions extends Callbacks {
    faceScanId: string;
}
declare class Measurement {
    #private;
    constructor(accessKey?: string, urlType?: URLType, token?: string);
    getMeasurementResult(scanId: string): Promise<AxiosResponse<any>>;
    getMeasurementRecommendation({ scanId, shopDomain, productName }: MeasurementRecommendation): Promise<AxiosResponse<any>>;
    /**
     * Releases everything held for one body scan.
     *
     * Callers own the lifetime, because only they know when a result is final.
     * The client cannot tell: a socket that has delivered a final frame looks the
     * same as one still waiting, and closing on the caller's behalf would cut off
     * the late result that is the only signal a scan failed after the user moved
     * on. Safe to call more than once, and for a scan that never opened a socket.
     */
    closeMeasurementSocket(scanId: string): void;
    /** As closeMeasurementSocket, for a face scan. */
    closeFaceScanSocket(faceScanId: string): void;
    handleMeasurementSocket(options: MeasurementSocketOptions): void;
    handlFaceScaneSocket(options: FaceScanSocketOptions): void;
}
export default Measurement;
