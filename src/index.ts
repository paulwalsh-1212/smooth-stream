export type StreamProcessorOptions = {
  stream: ReadableStream;
  typingSpeed?: number; // Speed in ms per character, default is 50ms
  onChar?: (char: string) => void; // Callback for each character displayed
  onComplete?: (buffer: string) => void; // Callback when the stream is complete
};

export class StreamProcessor {
  private stream: ReadableStream;
  private typingSpeed: number;
  private onChar?: (char: string) => void;
  private onComplete?: (buffer: string) => void;
  private buffer: string = '';
  private remainingText: string = '';
  private animationFrameId: number | null = null;

  constructor({
    stream,
    typingSpeed = 50,
    onChar,
    onComplete,
  }: StreamProcessorOptions) {
    this.stream = stream;
    this.typingSpeed = typingSpeed;
    this.onChar = onChar;
    this.onComplete = onComplete;
  }

  private pushCharToCallback(char: string) {
    if (this.onChar) {
      this.onChar(char);
    }
  }

  private processChunk(chunk: string) {
    for (let char of chunk) {
      this.remainingText += char;
    }
  }

  private writeCharByChar = () => {
    if (this.remainingText.length > 0) {
      const char = this.remainingText[0];
      this.remainingText = this.remainingText.slice(1);
      this.pushCharToCallback(char);
    }

    if (this.remainingText.length > 0) {
      this.animationFrameId = globalThis.setTimeout(
        this.writeCharByChar,
        this.typingSpeed,
      );
    }
  };

  public async start() {
    const reader = this.stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        this.buffer += chunk;
        this.processChunk(chunk);
        this.writeCharByChar();
      }

      if (this.onComplete) {
        this.onComplete(this.buffer);
      }
    } catch (error) {
      console.error('Error processing stream:', error);
    } finally {
      reader.releaseLock();
    }
  }

  public stop() {
    if (this.animationFrameId !== null) {
      globalThis.clearTimeout(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public getBuffer() {
    return this.buffer;
  }
}
