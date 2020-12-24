class QriWaveProcessor extends AudioWorkletProcessor {
  q = 42;
  stride = 23;
  buffer = [];
  lastIndex = 0;

  constructor(options) {
    super();

    const processorOptions = options?.processorOptions ?? {};
    this.q = processorOptions?.q ?? this.q;
    this.stride = processorOptions?.stride ?? this.stride;
    console.log('cool');
  }

  quantize(data) {
    const q = this.q;
    const stride = this.stride;
    return Array.from(data).filter((_, i) => ((i % stride) === 0)).map(x => Math.round(x * q) / q);
  }

  process(inputs, outputs, parameters) {
    const inputChannel = inputs[0][0] ?? [];
    const currentBuffer = this.quantize(inputChannel);
    this.buffer.push(...currentBuffer);
    const outputChannel = outputs[0][0];

    for (let i = 0; i < outputChannel.length && this.buffer.length > currentBuffer.length; i++) {
      if (this.lastIndex >= this.stride) {
        this.lastIndex = 0;
        this.buffer.shift();
      }

      const a = this.buffer[0];
      const b = this.buffer[1];
      const m = (b - a) / (this.stride - this.lastIndex);

      outputChannel[i] = a;
      this.buffer[0] = m + a;

      this.lastIndex++;
    }


    return true;
  }
}

registerProcessor('qri-wave-processor', QriWaveProcessor);
