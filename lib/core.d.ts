import { IMobxVisualizer, VisualizerEvent, VisualizerOptions } from './types';
export declare class MobXVisualizer implements IMobxVisualizer {
    events: VisualizerEvent[];
    isInitialized: boolean;
    private options;
    constructor(options?: VisualizerOptions);
    private setupSpy;
    getEvents(): VisualizerEvent[];
    clearEvents(): void;
    private setupDom;
    renderSVG(): Promise<string>;
}
export default MobXVisualizer;
