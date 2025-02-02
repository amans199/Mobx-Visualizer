import { VisualizerEvent, VisualizerOptions } from './types';
export declare const processEventType: (event: any) => VisualizerEvent | null;
export declare const shouldTrackEvent: (event: any, options: VisualizerOptions) => boolean;
export declare const formatToSequenceDiagram: (events: any) => string;
export declare const extractStoreName: (objectName: string | undefined) => string | null;
export declare const extractEventName: (eventName: string) => string;
export declare const formatFunctionName: (name: string) => string;
export declare const logExplanation: (event: any) => string;
