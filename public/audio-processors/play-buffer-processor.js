class PlayBufferProcessor extends AudioWorkletProcessor {
  buffer = [];
  done = false;

  constructor(options) {
    super();

    this.buffer = options?.processorOptions?.buffer ?? [];
  }

  process(inputs, outputs, parameters) {
    const outputChannel = outputs[0][0];
    
    for (let i = 0; i < outputChannel.length; i++) {
      outputChannel[i] = this.buffer.shift() ?? 0;
    }

    if (!this.done && this.buffer.length === 0) {
      this.done = true;
      this.port.postMessage('done');
    }
    
    return true;
  }
}

registerProcessor('play-buffer-processor', PlayBufferProcessor);
