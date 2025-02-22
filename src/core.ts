import { spy } from 'mobx';

import {
  clearObjectNameCache,
  formatToSequenceDiagram,
  logExplanation,
  processEventType,
  shouldTrackEvent,
} from './utils';
import { IMobxVisualizer, VisualizerEvent, VisualizerOptions } from './types';
import mermaid from 'mermaid';

export class MobXVisualizer implements IMobxVisualizer {
  events: VisualizerEvent[] = [];
  isInitialized = false;
  private readonly maxEvents: number;
  private options: VisualizerOptions;
  private cleanupSpy: (() => void) | null = null;
  constructor(options: VisualizerOptions = {}) {
    this.options = options;
    this.maxEvents = options.maxEvents || 1000; // Default limit
    this.setupSpy();
    this.setupDom();
    this.isInitialized = true;
  }

  private setupSpy() {
    this.cleanupSpy = spy(event => {
      try {
        if (shouldTrackEvent(event, this.options)) {
          const visualizerEvent = processEventType(event);
          if (!visualizerEvent) return;
          if (visualizerEvent.name === 'completed')
            console.log({ event, visualizerEvent });
          if (this.options?.debug) logExplanation(visualizerEvent);
          this.events = [...this.events, visualizerEvent];

          // Trim events if exceeding max
          if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
          }

          this.options.eventHook?.(visualizerEvent);
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

  destroy() {
    this.clearEvents();
    this.cleanupSpy?.();
    this.cleanupSpy = null;
    this.isInitialized = false;
    document.querySelector('button[style*="position: fixed"]')?.remove();
    clearObjectNameCache();
  }

  private setupDom() {
    if (this.isInitialized || !this.options?.debug) return;
    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'Download Mobx Sequence Diagram';
    downloadButton.style.position = 'fixed';
    downloadButton.style.bottom = '20px';
    downloadButton.style.right = '20px';
    downloadButton.style.zIndex = '9999';
    downloadButton.style.padding = '10px';
    downloadButton.style.border = 'none';
    downloadButton.style.backgroundColor = '#000';
    downloadButton.style.color = '#fff';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.borderRadius = '5px';
    downloadButton.style.fontSize = '16px';
    downloadButton.style.fontWeight = 'bold';
    downloadButton.style.boxShadow = '0 5px 10px rgba(0,0,0,0.2)';
    downloadButton.classList.add('movis-button');

    downloadButton.onclick = async () => {
      const blobURL = await this.renderSVG();
      window.open(blobURL, '_blank');
    };
    document.body.appendChild(downloadButton);
  }

  public async renderSVG(): Promise<string> {
    const diagram = formatToSequenceDiagram(this.events);
    await mermaid.initialize({
      startOnLoad: true,
      maxTextSize: 90000,
      sequence: { useMaxWidth: false },
    });

    // Render the SVG
    const { svg } = await mermaid.render('movis-sequence-diagram', diagram);

    // Create a Blob for the SVG data
    const blob = new Blob([svg], { type: 'image/svg+xml' });

    // Generate a URL for the Blob
    const blobURL = URL.createObjectURL(blob);

    // Log the Blob URL to the console
    console.log('Download or open the Mobx diagram:', blobURL);

    // Create a download link (optional)
    const link = document.createElement('a');
    link.href = blobURL;
    link.download = 'movis.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return blobURL; // Return the Blob URL
  }
}

export default MobXVisualizer;
