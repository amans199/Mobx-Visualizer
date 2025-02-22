# MobX Visualizer

A powerful tool for visualizing MobX events as sequence diagrams, helping developers debug and understand state management flows in their applications.

## Features

- Tracks MobX events (actions, updates, etc.) and generates sequence diagrams using Mermaid.js.
- Provides a debug mode with detailed console logging.
- Automatically adds a "Download Diagram" button to your app in debug mode.
- Customizable via options (e.g., exclude specific stores or actions).
- Exports SVG diagrams for easy sharing and analysis.

## Installation

Install the package via npm:

```bash
npm install mobx-visualizer --save-dev
```


## Usage

### Basic Setup

Import and initialize the visualizer in your application:

```javascript
import React from "react";
import mobxVisualizer from "mobx-visualizer";

mobxVisualizer({ debug: true });

function App() {
  return (
    <div>
      <h1>My App</h1>
      {/* Your app content */}
    </div>
  );
}

export default App;
```

When `debug: true` is set, a "Download Mobx Sequence Diagram" button will appear in the bottom-right corner of your app. Clicking it generates and downloads an SVG of the recorded MobX events (Make sure to allow your localhost to download files in your browser's security settings). It will also console log every observed change to the MobX state.

### Advanced Configuration

Customize the visualizer with options:

```javascript
import mobxVisualizer from "mobx-visualizer";

const visualizer = mobxVisualizer({
  debug: true, // Enable debug logging and download button
  excludeStores: ["TempStore"], // Ignore events from specific stores
  excludeActions: ["initialize"], // Ignore specific action names
  eventHook: (event) => console.log("New event:", event), // Custom event handler
});

// Generate SVG manually if needed
visualizer.renderSVG().then((url) => console.log("Diagram URL:", url));
```

### React Integration Example

Integrate with a MobX-powered React app:

```javascript
import React from "react";
import { RootStore } from "./stores/RootStore";
import { StoreProvider } from "./stores/StoreContext";
import mobxVisualizer from "mobx-visualizer";

const visualizer = mobxVisualizer({ debug: true });
const rootStore = new RootStore();

function App() {
  return (
    <StoreProvider store={rootStore}>
      <div className="min-h-screen bg-gray-100">
        <h1>Todo App</h1>
        {/* Your components */}
      </div>
    </StoreProvider>
  );
}

export default App;
```

## API

### `mobxVisualizer(options)`

Creates a new visualizer instance.

#### Options
| Property         | Type                        | Description                                      | Default     |
|------------------|-----------------------------|--------------------------------------------------|-------------|
| `debug`          | `boolean`                  | Enable debug logging and download button         | `false`     |
| `excludeStores`  | `string[]`                 | Stores to exclude from tracking                  | `[]`        |
| `excludeActions` | `string[]`                 | Actions to exclude from tracking                 | `[]`        |
| `eventHook`      | `(event: VisualizerEvent) => void` | Callback for each tracked event          | `undefined` |

#### Methods
- `getEvents(): VisualizerEvent[]` - Returns all tracked events.
- `clearEvents(): void` - Clears the event history.
- `renderSVG(): Promise<string>` - Generates an SVG diagram and returns its Blob URL.

### `VisualizerEvent`
Represents a tracked MobX event:
| Property    | Type     | Description                     |
|-------------|----------|---------------------------------|
| `event`     | `any`    | Raw MobX event data            |
| `id`        | `string` | Unique event identifier        |
| `timestamp` | `number` | Event timestamp (milliseconds) |
| `type`      | `string` | Event type (e.g., "action")    |
| `name`      | `string` | Event name                     |
| `object`    | `string` | Source object/store name       |

## How It Works

1. **Event Tracking**: Uses MobX’s `spy` to intercept events (actions, updates, etc.).
2. **Filtering**: Applies filters based on `options` to exclude unwanted events.
3. **Diagram Generation**: Converts events into a Mermaid sequence diagram.
4. **Rendering**: In debug mode, adds a button to download the SVG; otherwise, provides `renderSVG()` for manual generation.

## Example Diagram

Here’s what a generated sequence diagram might look like:

```
sequenceDiagram
  participant RootStore
  RootStore ->> RootStore: [12:00:00] addTodo("Buy milk")
  RootStore ->> RootStore: [12:00:01] toggleTodo(1)
```

## Limitations
- **Event Types**: Currently tracks a subset of MobX events (excludes reactions, adds, removes, deletes, and splices by default).
- **Browser Only**: The download button feature requires a DOM environment.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

### Development Setup

Clone and install dependencies:

```bash
git clone https://github.com/amans199/mobx-visualizer.git
cd mobx-visualizer
npm install
```

Build the package:

```bash
npm run build
```

## License

MIT License © 2025 [Your Name/Organization]

---

This documentation covers installation, usage, API details, and contribution guidelines. You can customize the repository URL, author name, and license as needed when adding it to your GitHub project! Let me know if you’d like to tweak anything further.