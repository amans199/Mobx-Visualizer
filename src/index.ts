export * from './core';
export * from './types';

// Add a default export with initialization helper
import MobXVisualizer, { MobXVisualizer as MobXVisualizerClass } from './core';
import { VisualizerOptions } from './types';

// Factory function to create visualizer instance
// index.ts
let instance: MobXVisualizer | null = null;

export const createMobXVisualizer = (options: VisualizerOptions = {}) => {
  if (!instance) {
    instance = new MobXVisualizerClass(options);
  }
  return instance;
};

// Default export for convenience
export default createMobXVisualizer;
