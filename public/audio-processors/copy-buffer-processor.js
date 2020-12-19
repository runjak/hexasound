const bufferSize = 4096;

class CopyBufferProcessor extends AudioWorkletProcessor {
  copyMode = 'all'; // 'all' | 'first' | 'none'
  buffers = []; // channel -> buffer

  constructor(options) {
    super();

    this.copyMode = options?.processorOptions?.copyMode ?? 'all';
  }

  get shouldCopy() {
    return this.copyMode === 'all' || this.copyMode === 'first';
  }

  addToBuffer(inputIndex, channelIndex, channelData) {
    const previousBuffer = this.buffers[channelIndex] ?? [];
    const nextBuffer = [...previousBuffer, ...Array.from(channelData)];

    if (nextBuffer.length >= bufferSize) {
      this.port.postMessage({ buffer: nextBuffer, channelIndex, inputIndex });
      this.buffers[channelIndex] = [];

      if (this.copyMode === 'first') {
        this.copyMode = 'none';
      }
    } else {
      this.buffers[channelIndex] = nextBuffer;
    }
  }

  process(inputs, outputs, parameters) {
    const shouldCopy = this.shouldCopy;
    for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
      const input = inputs[inputIndex];
      const output = outputs[inputIndex];

      for (let channelIndex = 0; channelIndex < input.length; channelIndex++) {
        const inputChannel = input[channelIndex];
        const outputChannel = output[channelIndex];

        for (let i = 0; i < inputChannel.length; i++) {
          outputChannel[i] = inputChannel[i];
        }

        if (shouldCopy) {
          this.addToBuffer(inputIndex, channelIndex, inputChannel);
        }
      }
    }

    return true;
  }
}

registerProcessor('copy-buffer-processor', CopyBufferProcessor);
