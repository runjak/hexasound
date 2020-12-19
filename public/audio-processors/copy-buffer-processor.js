const bufferSize = 4096;

class CopyBufferProcessor extends AudioWorkletProcessor {
  copyMode = 'all'; // 'all' | 'first' | 'none'
  buffers = {}; // input+channel -> buffer

  constructor(options) {
    super();

    this.copyMode = options?.processorOptions?.copyMode ?? 'all';
  }

  get shouldCopy() {
    return this.copyMode === 'all' || this.copyMode === 'first';
  }

  addToBuffer(inputIndex, channelIndex, channelData) {
    const key = `${inputIndex}+${channelIndex}`;
    const buffer = this.buffers[key] ?? [];
    buffer.push(...Array.from(channelData));

    if (buffer.length >= bufferSize) {
      this.port.postMessage({ buffer: buffer, channelIndex, inputIndex });
      this.buffers[key] = [];

      if (this.copyMode === 'first') {
        this.copyMode = 'none';
      }
    } else {
      this.buffers[key] = buffer;
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
