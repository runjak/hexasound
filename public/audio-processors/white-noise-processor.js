class WhiteNoiseProcessor extends AudioWorkletProcessor {
  amplitude = 1;

  constructor(options) {
    super();
    this.amplitude = (options)?.processorOptions?.amplitude ?? 1;
    console.log('DRAGONS', options);
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach(channel => {
      for (let i = 0; i < channel.length; i++) {
        channel[i] = (Math.random() * 2 - 1) * this.amplitude;
      }
    });
    return true;
  }
}

registerProcessor('white-noise-processor', WhiteNoiseProcessor);
