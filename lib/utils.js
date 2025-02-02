"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExplanation = exports.formatFunctionName = exports.extractEventName = exports.extractStoreName = exports.formatToSequenceDiagram = exports.shouldTrackEvent = exports.processEventType = void 0;
const mobx_1 = require("mobx");
const uuid_1 = require("uuid");
const processEventType = (event) => {
    const objectName = _getObjectName(event.object);
    if (!objectName || (objectName === null || objectName === void 0 ? void 0 : objectName.includes('[..]')))
        return null;
    const eventName = event.name || (0, exports.extractEventName)(event.debugObjectName);
    return {
        event,
        id: (0, uuid_1.v4)(),
        timestamp: new Date().getTime(),
        type: event.type,
        name: eventName,
        object: objectName,
    };
};
exports.processEventType = processEventType;
const shouldTrackEvent = (event, options) => {
    var _a, _b;
    if (!event || !event.type)
        return false;
    const objectName = _getObjectName(event.object);
    if (!objectName)
        return false;
    if ((_a = options.excludeStores) === null || _a === void 0 ? void 0 : _a.includes(objectName)) {
        return false;
    }
    if (event.type === 'action' && ((_b = options.excludeActions) === null || _b === void 0 ? void 0 : _b.includes(event.name))) {
        return false;
    }
    // exclude reactions and add and remove and delete and splice
    if (event.type === 'reaction' ||
        event.type === 'add' ||
        event.type === 'remove' ||
        event.type === 'delete' ||
        event.type === 'splice') {
        return false;
    }
    return true;
};
exports.shouldTrackEvent = shouldTrackEvent;
const formatToSequenceDiagram = events => {
    const objects = events
        .filter(event => event.object)
        .map(event => event.object)
        .filter((value, index, self) => self.indexOf(value) === index);
    console.log('🚀 ~ formatToSequenceDiagram ~ objects:', events, objects);
    const participants = objects
        .map(objectName => {
        return `participant ${objectName}`;
    })
        .join('\n');
    console.log('🚀 ~ formatToSequenceDiagram ~ participants:', participants);
    const diagramData = events.map(event => formatSingleEvent(event)).join('\n');
    console.log('🚀 ~ formatToSequenceDiagram ~ diagramData:', diagramData);
    const diagram = `sequenceDiagram
  ${participants}

  ${diagramData}
  `;
    return diagram;
};
exports.formatToSequenceDiagram = formatToSequenceDiagram;
const formatSingleEvent = (visualizerEvent) => {
    var _a;
    const objectName = visualizerEvent.object;
    if (!objectName)
        return null;
    switch (visualizerEvent.type) {
        case 'action':
            return `${objectName} ->> ${objectName}: [${formatTimeStamp(visualizerEvent.timestamp)}] ${(0, exports.formatFunctionName)(visualizerEvent.name)}(${formatArgsToReadable(visualizerEvent.event.arguments)})`;
        case 'reaction':
            return `${visualizerEvent.name} ->> ${objectName}: [${formatTimeStamp(visualizerEvent.timestamp)}] Reaction triggered`;
        case 'error':
            return `${visualizerEvent.name} ->> ${objectName}: Error: ${visualizerEvent.message} [${formatTimeStamp(visualizerEvent.timestamp)}]`;
        default:
            return `Note Over ${objectName}: [${formatTimeStamp(visualizerEvent.timestamp)}] ${visualizerEvent.name} (${visualizerEvent.type}) (newValue: ${formatNewValue((_a = visualizerEvent.event) === null || _a === void 0 ? void 0 : _a.newValue)})`;
    }
};
const _getObjectName = (target) => {
    if (!target)
        return null;
    try {
        const debugName = (0, mobx_1.getDebugName)(target);
        return (0, exports.extractStoreName)(debugName);
    }
    catch (error) {
        console.warn('Failed to get debug name:', error);
    }
    return 'Unknown';
};
const extractStoreName = (objectName) => {
    if (!objectName)
        return null;
    const match = objectName.match(/^(\w+)/); // Extract the store name before `@` or `.`
    return match ? match[1] : objectName;
};
exports.extractStoreName = extractStoreName;
const extractEventName = (eventName) => {
    return eventName.replace(/^.*\./, '').replace(/\?$/, '');
};
exports.extractEventName = extractEventName;
const formatFunctionName = (name) => {
    return name.replace(/^.*\./, '');
};
exports.formatFunctionName = formatFunctionName;
const formatObjectToReadableString = obj => {
    const readable2 = JSON.stringify(obj, null, 2)
        .replace(/,/g, '')
        .replace(/(\n)/g, ',<br/>');
    return readable2;
};
const formatTimeStamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
};
const formatArgsToReadable = (args) => {
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
const formatNewValue = (newValue, returnType = 'string') => {
    if (typeof newValue === 'object') {
        const newObject = JSON.parse(JSON.stringify(newValue));
        if (returnType === 'object')
            return newObject;
        return formatObjectToReadableString(newObject);
    }
    return newValue !== undefined ? newValue : 'undefined';
};
const logExplanation = event => {
    if (event.type === 'action') {
        console.log(`The function '${event.name}' was triggered in '${event.object}'.`);
    }
    else if (event.type === 'update') {
        console.log(`The observable '${event.name}' in '${event.object}' was updated from '${event.event.oldValue}' to:`, formatNewValue(event.event.newValue, 'object'));
    }
    else if (event.type === 'reaction') {
        console.log(`The reaction '${event.name}' was triggered in '${event.object}'.`);
    }
    else if (event.type === 'error') {
        console.log(`An error occurred in '${event.object}': ${event.message}`);
    }
    else if (event.type === 'splice') {
        console.log(`The observable array '${event.name}' in '${event.object}' was updated by '${event.event.addedCount}' elements added and '${event.event.removedCount}' elements removed.`);
    }
    else if (event.type === 'computed') {
        console.log(`The computed property '${event.name}' in '${event.object}' was updated to:`, formatNewValue(event.event.newValue, 'object'));
    }
    else if (event.type === 'async-start') {
        console.log(`An async action '${event.name}' was started in '${event.object}'.`);
    }
    else if (event.type === 'async-end') {
        console.log(`An async action '${event.name}' was ended in '${event.object}'.`);
    }
    else {
        console.log('Unknown event type');
    }
    return 'Unknown event type';
};
exports.logExplanation = logExplanation;
