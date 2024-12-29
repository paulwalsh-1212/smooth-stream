// StreamProcessor.test.ts
import { StreamProcessor } from '../src/index';

describe('StreamProcessor', () => {
  it('should process the stream and call onChar for each character', async () => {
    const streamContent = 'Hello, world!';
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(streamContent));
        controller.close();
      },
    });

    const chars: string[] = [];
    const onChar = (char: string) => chars.push(char);

    const processor = new StreamProcessor({
      stream,
      typingSpeed: 10, // Reduced speed to simulate typing more quickly in the test
      onChar,
    });

    await processor.start();

    // Wait for all characters to be processed
    await new Promise((resolve) =>
      setTimeout(resolve, streamContent.length * 20),
    );

    expect(chars.join('')).toBe(streamContent);
  });

  it('should call onComplete with the full buffer content', async () => {
    const streamContent = 'Stream complete test';
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(streamContent));
        controller.close();
      },
    });

    let completeBuffer = '';
    const onComplete = (buffer: string) => (completeBuffer = buffer);

    const processor = new StreamProcessor({
      stream,
      typingSpeed: 0,
      onComplete,
    });

    await processor.start();

    expect(completeBuffer).toBe(streamContent);
  });

  it('should accumulate buffer content correctly', async () => {
    const chunks = ['Chunk 1', 'Chunk 2', 'Chunk 3'];
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
        controller.close();
      },
    });

    const processor = new StreamProcessor({
      stream,
      typingSpeed: 0,
    });

    await processor.start();

    expect(processor.getBuffer()).toBe(chunks.join(''));
  });
});
