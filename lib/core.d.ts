import { IMobxVisualizer, VisualizerEvent, VisualizerOptions } from './types';
export declare class MobXVisualizer implements IMobxVisualizer {
    events: VisualizerEvent[];
    private options;
    constructor(options?: VisualizerOptions);
    private setupSpy;
    getEvents(): VisualizerEvent[];
    clearEvents(): void;
    renderSVG(): Promise<string>;
}
export default MobXVisualizer;
