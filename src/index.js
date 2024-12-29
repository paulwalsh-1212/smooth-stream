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
exports.StreamProcessor = void 0;
class StreamProcessor {
    constructor({ stream, typingSpeed = 50, onChar, onComplete, }) {
        this.buffer = '';
        this.remainingText = '';
        this.animationFrameId = null;
        this.writeCharByChar = () => {
            if (this.remainingText.length > 0) {
                const char = this.remainingText[0];
                this.remainingText = this.remainingText.slice(1);
                this.pushCharToCallback(char);
            }
            if (this.remainingText.length > 0) {
                this.animationFrameId = globalThis.setTimeout(this.writeCharByChar, this.typingSpeed);
            }
        };
        this.stream = stream;
        this.typingSpeed = typingSpeed;
        this.onChar = onChar;
        this.onComplete = onComplete;
    }
    pushCharToCallback(char) {
        if (this.onChar) {
            this.onChar(char);
        }
    }
    processChunk(chunk) {
        for (let char of chunk) {
            this.remainingText += char;
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = this.stream.getReader();
            const decoder = new TextDecoder();
            try {
                while (true) {
                    const { value, done } = yield reader.read();
                    if (done)
                        break;
                    const chunk = decoder.decode(value, { stream: true });
                    this.buffer += chunk;
                    this.processChunk(chunk);
                    this.writeCharByChar();
                }
                if (this.onComplete) {
                    this.onComplete(this.buffer);
                }
            }
            catch (error) {
                console.error('Error processing stream:', error);
            }
            finally {
                reader.releaseLock();
            }
        });
    }
    stop() {
        if (this.animationFrameId !== null) {
            globalThis.clearTimeout(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    getBuffer() {
        return this.buffer;
    }
}
exports.StreamProcessor = StreamProcessor;
