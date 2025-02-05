import { getDebugName } from 'mobx';
import { VisualizerEvent, VisualizerOptions } from './types';
import { v4 as uuidv4 } from 'uuid';

export const processEventType = (event: any): VisualizerEvent | null => {
  const objectName = _getObjectName(event.object);

  if (!objectName || objectName?.includes('[..]')) return null;

  const eventName = event.name || extractEventName(event.debugObjectName);

  return {
    event,
    id: uuidv4(),
    timestamp: new Date().getTime(),
    type: event.type,
    name: eventName,
    object: objectName,
  };
};

export const shouldTrackEvent = (
  event: any,
  options: VisualizerOptions
): boolean => {
  if (!event || !event.type) return false;

  const storeName = _getObjectName(event.object);

  if (!storeName) return false;

  if (options.excludeStores?.includes(storeName)) {
    return false;
  }

  if (event.type === 'action' && options.excludeActions?.includes(event.name)) {
    return false;
  }

  // exclude reactions and add and remove and delete and splice
  if (
    event.type === 'reaction' ||
    event.type === 'add' ||
    event.type === 'remove' ||
    event.type === 'delete' ||
    event.type === 'splice'
  ) {
    return false;
  }

  return true;
};

export const formatToSequenceDiagram = events => {
  const objects = events
    .filter(event => event.object)
    .map(event => event.object)
    .filter((value, index, self) => self.indexOf(value) === index);

  const participants = objects
    .map(objectName => {
      return `participant ${objectName}`;
    })
    .join('\n');

  const diagramData = events.map(event => formatSingleEvent(event)).join('\n');

  const diagram = `sequenceDiagram
  ${participants}

  ${diagramData}
  `;
  return diagram;
};

const formatSingleEvent = (visualizerEvent: VisualizerEvent) => {
  const objectName = visualizerEvent.object;

  if (!objectName) return null;

  switch (visualizerEvent.type) {
    case 'action':
      return `${objectName} ->> ${objectName}: [${formatTimeStamp(visualizerEvent.timestamp)}] ${formatFunctionName(visualizerEvent.name)}(${formatArgsToReadable(visualizerEvent.event.arguments)})`;
    case 'reaction':
      return `${visualizerEvent.name} ->> ${objectName}: [${formatTimeStamp(visualizerEvent.timestamp)}] Reaction triggered`;
    case 'error':
      return `${visualizerEvent.name} ->> ${objectName}: Error: ${visualizerEvent.message} [${formatTimeStamp(visualizerEvent.timestamp)}]`;
    default:
      return `Note Over ${objectName}: [${formatTimeStamp(visualizerEvent.timestamp)}] ${visualizerEvent.name} (${visualizerEvent.type}) (newValue: ${formatNewValue(visualizerEvent.event?.newValue)})`;
  }
};

// TODO!: Figure out the best way to et the object name for all event types
const _getObjectName = (target: any): string | null => {
  if (!target) return null;
  try {
    if (target?.constructor?.name !== 'Object') return target.constructor.name;
    const debugName = getDebugName(target);
    return extractStoreName(debugName);
  } catch (error) {
    console.warn('Failed to get debug name:', error);
  }
  return 'Unknown';
};

export const extractStoreName = (
  objectName: string | undefined
): string | null => {
  if (!objectName) return null;
  const match = objectName.match(/^(\w+)/); // Extract the store name before `@` or `.`
  return match ? match[1] : objectName;
};

export const extractEventName = (eventName: string): string => {
  return eventName.replace(/^.*\./, '').replace(/\?$/, '');
};
export const formatFunctionName = (name: string): string => {
  return name.replace(/^.*\./, '');
};

const formatObjectToReadableString = obj => {
  const readable2 = JSON.stringify(obj, null, 2)
    .replace(/,/g, '')
    .replace(/(\n)/g, ',<br/>');

  return readable2;
};

const formatTimeStamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString();
};

const formatArgsToReadable = (args: any[]): string => {
  return args
    .map(arg => {
      if (typeof arg === 'object') {
        // if the object is huge write { ... Big Object ... } instead of the whole object
        if (JSON.stringify(arg).length > 100) {
          return '{ ... Big Object ... }';
        }
        return formatObjectToReadableString(arg);
      }
      return arg;
    })
    .join(', ');
};

const formatNewValue = (
  newValue: any,
  returnType: 'string' | 'object' = 'string'
): string => {
  if (typeof newValue === 'object') {
    const newObject = JSON.parse(JSON.stringify(newValue));
    if (returnType === 'object') return newObject;
    return formatObjectToReadableString(newObject);
  }

  return newValue !== undefined ? newValue : 'undefined';
};

export const logExplanation = event => {
  if (event.type === 'action') {
    console.log(
      `The function '${event.name}' was triggered in '${event.object}'.`
    );
  } else if (event.type === 'update') {
    console.log(
      `The observable '${event.name}' in '${event.object}' was updated from '${event.event.oldValue}' to:`,
      formatNewValue(event.event.newValue, 'object')
    );
  } else if (event.type === 'reaction') {
    console.log(
      `The reaction '${event.name}' was triggered in '${event.object}'.`
    );
  } else if (event.type === 'error') {
    console.log(`An error occurred in '${event.object}': ${event.message}`);
  } else if (event.type === 'splice') {
    console.log(
      `The observable array '${event.name}' in '${event.object}' was updated by '${event.event.addedCount}' elements added and '${event.event.removedCount}' elements removed.`
    );
  } else if (event.type === 'computed') {
    console.log(
      `The computed property '${event.name}' in '${event.object}' was updated to:`,
      formatNewValue(event.event.newValue, 'object')
    );
  } else if (event.type === 'async-start') {
    console.log(
      `An async action '${event.name}' was started in '${event.object}'.`
    );
  } else if (event.type === 'async-end') {
    console.log(
      `An async action '${event.name}' was ended in '${event.object}'.`
    );
  } else {
    console.log('Unknown event type');
  }
  return 'Unknown event type';
};
