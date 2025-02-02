import { configure, spy } from 'mobx';

import {
  formatToSequenceDiagram,
  logExplanation,
  processEventType,
  shouldTrackEvent,
} from './utils';
import { IMobxVisualizer, VisualizerEvent, VisualizerOptions } from './types';
import mermaid from 'mermaid';

export class MobXVisualizer implements IMobxVisualizer {
  events: VisualizerEvent[] = [];
  private options: VisualizerOptions;

  constructor(options: VisualizerOptions = {}) {
    this.options = options;
    configure({ enforceActions: 'observed' });
    this.setupSpy();
  }

  private setupSpy() {
    spy(event => {
      try {
        if (shouldTrackEvent(event, this.options)) {
          const visualizerEvent = processEventType(event);
          if (visualizerEvent) {
            if (this.options?.debug) logExplanation(visualizerEvent);
            this.events = [...this.events, visualizerEvent];
            this.options.eventHook?.(visualizerEvent);
          }
        }
      } catch (error) {
        console.warn('Failed to track MobX event:', error);
      }
    });
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }

  public async renderSVG(): Promise<string> {
    const diagram = formatToSequenceDiagram(this.events);
    await mermaid.initialize({
      startOnLoad: true,
      maxTextSize: 90000,
      sequence: { useMaxWidth: false },
    });

    // Render the SVG
    const { svg } = await mermaid.render('mobx-sequence-diagram', diagram);

    // Create a Blob for the SVG data
    const blob = new Blob([svg], { type: 'image/svg+xml' });

    // Generate a URL for the Blob
    const blobURL = URL.createObjectURL(blob);

    // Log the Blob URL to the console
    console.log('Download or open the diagram:', blobURL);

    // Create a download link (optional)
    const link = document.createElement('a');
    link.href = blobURL;
    link.download = 'sequence-diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return blobURL; // Return the Blob URL
  }
}

export default MobXVisualizer;
