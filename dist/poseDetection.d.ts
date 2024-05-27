interface VideoEmitOptions {
    image: string;
    scanId: string;
}
type PoseStatusCallback = (data: any) => void;
declare class PoseDetection {
    #private;
    constructor(accessKey: string, stagingUrl?: boolean);
    connect(): Promise<string>;
    videoEmit({ image, scanId }: VideoEmitOptions): void;
    disconnect(): void;
    poseStatus(callBack: PoseStatusCallback): void;
    connected(): boolean;
}
export default PoseDetection;
