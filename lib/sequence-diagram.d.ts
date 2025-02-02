import { VisualizerEvent } from './types';
export declare class SequenceDiagramGenerator {
    private events;
    constructor(events: VisualizerEvent[]);
    renderSVG(): Promise<string>;
}
