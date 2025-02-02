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
exports.SequenceDiagramGenerator = void 0;
const mermaid_1 = __importDefault(require("mermaid"));
const utils_1 = require("./utils");
class SequenceDiagramGenerator {
    constructor(events) {
        this.events = events;
    }
    renderSVG() {
        return __awaiter(this, void 0, void 0, function* () {
            const diagram = (0, utils_1.formatToSequenceDiagram)(this.events);
            yield mermaid_1.default.initialize({
                startOnLoad: false,
                sequence: { useMaxWidth: false },
            });
            // Render the SVG
            const { svg } = yield mermaid_1.default.render('mobx-sequence-diagram', diagram);
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
        });
    }
}
exports.SequenceDiagramGenerator = SequenceDiagramGenerator;
