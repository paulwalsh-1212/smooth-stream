# smooth-stream

**Smooth Stream** is a lightweight TypeScript library for processing readable streams. It allows you to process chunks from a readable stream character by character, simulating typing, while also buffering the entire stream content in memory.

---

## Features

- **Stream Processing**: Handles readable streams chunk by chunk.
- **Typing Effect**: Processes and emits characters one by one, simulating typing.
- **Buffering**: Buffers the full stream content for further processing.
- **Callbacks**: Provides hooks for each character and the completion of the stream.

---

## Installation

Install the library using npm:

```bash
npm install smooth-stream
```

Or using pnpm:

```bash
pnpm add smooth-stream
```

---

## Usage

### Basic Example

```typescript
import { StreamProcessor } from 'smooth-stream';

const streamContent = 'Hello, Smooth Stream!';
const encoder = new TextEncoder();
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue(encoder.encode(streamContent));
    controller.close();
  },
});

const onChar = (char: string) => {
  process.stdout.write(char);
};

const onComplete = (buffer: string) => {
  console.log('\nStream processing complete:', buffer);
};

const processor = new StreamProcessor({
  stream,
  typingSpeed: 50, // Character display speed in milliseconds
  onChar,
  onComplete,
});

processor.start();
```

---

## API

### StreamProcessor

#### Constructor Options

| Option        | Type                       | Description                                          |
| ------------- | -------------------------- | ---------------------------------------------------- |
| `stream`      | `ReadableStream`           | The readable stream to process.                      |
| `typingSpeed` | `number`                   | Typing effect speed in milliseconds (default: 50ms). |
| `onChar`      | `(char: string) => void`   | Callback triggered for each character.               |
| `onComplete`  | `(buffer: string) => void` | Callback triggered when the stream completes.        |

#### Methods

- `start()`: Begins processing the stream.
- `stop()`: Stops character-by-character processing.
- `getBuffer()`: Returns the accumulated buffer as a string.

---

## Development

### Run Tests

```bash
pnpm test
```
