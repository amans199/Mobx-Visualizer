import { IAtom, IComputedValue, IReactionDisposer } from 'mobx';
export type EventType = 'action' | 'observable-change' | 'reaction' | 'computed' | 'async-start' | 'async-end' | 'error' | 'splice';
export interface VisualizerEvent {
    id: string;
    type: EventType;
    timestamp: number;
    name: string;
    event: any;
    target?: object;
    property?: string;
    value?: any;
    oldValue?: any;
    duration?: number;
    parentId?: string;
    metadata?: Record<string, any>;
    observableKind?: string;
    object?: string;
    message?: string;
    error?: Error;
}
export interface VisualizerOptions {
    excludeStores?: string[];
    excludeActions?: string[];
    includeStores?: string[];
    debug?: boolean;
    customNameFormatter?: (target: object, defaultName: string) => string;
    eventHook?: (event: VisualizerEvent) => void;
}
export interface DependencyNode {
    name: string;
    atom: IAtom | IComputedValue<any>;
    dependencies: DependencyNode[];
    observers: ObserverNode[];
}
export interface ObserverNode {
    name: string;
    observer: IReactionDisposer | IComputedValue<any>;
    observing: DependencyNode[];
}
export interface IMobxVisualizer {
    getEvents: () => VisualizerEvent[];
    clearEvents: () => void;
}
