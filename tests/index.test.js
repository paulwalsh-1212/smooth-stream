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
Object.defineProperty(exports, "__esModule", { value: true });
// StreamProcessor.test.ts
const index_1 = require("../src/index");
describe('StreamProcessor', () => {
    it('should process the stream and call onChar for each character', () => __awaiter(void 0, void 0, void 0, function* () {
        const streamContent = 'Hello, world!';
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(streamContent));
                controller.close();
            },
        });
        const chars = [];
        const onChar = (char) => chars.push(char);
        const processor = new index_1.StreamProcessor({
            stream,
            typingSpeed: 10, // Reduced speed to simulate typing more quickly in the test
            onChar,
        });
        yield processor.start();
        // Wait for all characters to be processed
        yield new Promise((resolve) => setTimeout(resolve, streamContent.length * 20));
        expect(chars.join('')).toBe(streamContent);
    }));
    it('should call onComplete with the full buffer content', () => __awaiter(void 0, void 0, void 0, function* () {
        const streamContent = 'Stream complete test';
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(streamContent));
                controller.close();
            },
        });
        let completeBuffer = '';
        const onComplete = (buffer) => (completeBuffer = buffer);
        const processor = new index_1.StreamProcessor({
            stream,
            typingSpeed: 0,
            onComplete,
        });
        yield processor.start();
        expect(completeBuffer).toBe(streamContent);
    }));
    it('should accumulate buffer content correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        const chunks = ['Chunk 1', 'Chunk 2', 'Chunk 3'];
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
                controller.close();
            },
        });
        const processor = new index_1.StreamProcessor({
            stream,
            typingSpeed: 0,
        });
        yield processor.start();
        expect(processor.getBuffer()).toBe(chunks.join(''));
    }));
});
