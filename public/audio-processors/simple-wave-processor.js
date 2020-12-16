const sin = Math.sin;
const square = (radians) => Math.sign(Math.sin(radians))
const sawtooth = (radians) => ((radians % Math.PI) / Math.PI * 2) - 1;
const triangle_ = (radians) => Math.asin(Math.sin(radians));
const triangle = (radians) => triangle_(radians) / (Math.PI / 2);
const hex = (radians) => Math.min(1, Math.max(triangle_(radians), -1));

const waveForms = {
  sin,
  square,
  sawtooth,
  triangle,
  hex
};

class SimpleWaveProcessor extends AudioWorkletProcessor {
  t = 0;
  wave = waveForms.sin;
  amplitude = 1;
  frequencies = [440];

  constructor(options) {
    super();

    const waveName = options?.processorOptions?.wave ?? 'sin';
    this.wave = waveForms[waveName];

    this.amplitude = options?.processorOptions?.amplitude ?? 1;
    this.frequencies = options?.processorOptions?.frequencies ?? [440];
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    output.forEach(channel => {
      // eslint-disable-next-line no-undef
      const delta = 1 / sampleRate;
      for (let i = 0; i < channel.length; i++) {
        this.t += delta;
        channel[i] = 0;
        for (let j = 0; j < this.frequencies.length; j++) {
          const frequency = this.frequencies[j];
          channel[i] += this.wave(Math.PI * 2 * (this.t * frequency)) * this.amplitude;
        }
        channel[i] /= this.frequencies.length;
      }
    });
    return true;
  }
}

registerProcessor('simple-wave-processor', SimpleWaveProcessor);
