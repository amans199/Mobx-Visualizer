"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobXVisualizer = void 0;
const mobx_1 = require("mobx");
const utils_1 = require("./utils");
const mermaid_1 = __importDefault(require("mermaid"));
class MobXVisualizer {
    constructor(options = {}) {
        this.events = [];
        this.isInitialized = false;
        this.options = options;
        (0, mobx_1.configure)({ enforceActions: 'observed' });
        this.setupSpy();
        this.setupDom();
        this.isInitialized = true;
    }
    setupSpy() {
        (0, mobx_1.spy)(event => {
            var _a, _b, _c;
            try {
                if ((0, utils_1.shouldTrackEvent)(event, this.options)) {
                    const visualizerEvent = (0, utils_1.processEventType)(event);
                    if (!visualizerEvent)
                        return;
                    if ((_a = this.options) === null || _a === void 0 ? void 0 : _a.debug)
                        (0, utils_1.logExplanation)(visualizerEvent);
                    this.events = [...this.events, visualizerEvent];
                    (_c = (_b = this.options).eventHook) === null || _c === void 0 ? void 0 : _c.call(_b, visualizerEvent);
                }
            }
            catch (error) {
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
    setupDom() {
        if (this.isInitialized)
            return;
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
        downloadButton.onclick = () => __awaiter(this, void 0, void 0, function* () {
            const blobURL = yield this.renderSVG();
            window.open(blobURL, '_blank');
        });
        document.body.appendChild(downloadButton);
    }
    renderSVG() {
        return __awaiter(this, void 0, void 0, function* () {
            const diagram = (0, utils_1.formatToSequenceDiagram)(this.events);
            yield mermaid_1.default.initialize({
                startOnLoad: true,
                maxTextSize: 90000,
                sequence: { useMaxWidth: false },
            });
            // Render the SVG
            const { svg } = yield mermaid_1.default.render('movis-sequence-diagram', diagram);
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
        });
    }
}
exports.MobXVisualizer = MobXVisualizer;
exports.default = MobXVisualizer;
