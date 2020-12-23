import { transform } from "./extern/fft";

const AudioContext = window.AudioContext;

const memo = <T extends unknown>(f: (() => T)): (() => T) => {
  let x: undefined | T = undefined;

  return (): T => {
    if (x === undefined) {
      x = f();
    }

    return x;
  };
};

export const createAudioContext = memo(async () => {
  const context = new AudioContext();

  await Promise.all([
    context.audioWorklet.addModule('/audio-processors/white-noise-processor.js'),
    context.audioWorklet.addModule('/audio-processors/simple-wave-processor.js'),
    context.audioWorklet.addModule('/audio-processors/copy-buffer-processor.js'),
  ]);

  return context;
});

export const createNoiseNode = (context: AudioContext, amplitude: number): AudioWorkletNode => (
  new AudioWorkletNode(context, 'white-noise-processor', { processorOptions: { amplitude } })
);

const bufferSize = 4096;

export type Wave = (radians: number) => number;

const sin: Wave = Math.sin;
const square: Wave = (radians) => Math.sign(Math.sin(radians))
const sawtooth: Wave = (radians) => ((radians % Math.PI) / Math.PI * 2) - 1;
const triangle_: Wave = (radians) => Math.asin(Math.sin(radians));
const triangle: Wave = (radians) => triangle_(radians) / (Math.PI / 2);
const hex: Wave = (radians) => Math.min(1, Math.max(triangle_(radians), -1));

export const createSimpleWaveNode = (context: AudioContext, wave: WaveName, frequencies: Array<number>, amplitude: number) => (
  new AudioWorkletNode(context, 'simple-wave-processor', { processorOptions: { wave, frequencies, amplitude } })
);

export const waves = { sin, square, sawtooth, triangle, hex };

export type WaveName = keyof typeof waves;

type BufferCopy = {
  buffer: Array<number>;
  channelIndex: number;
  inputIndex: number;
}
export const createCopyBufferNode = (context: AudioContext, copyMode: 'all' | 'first' | 'none', onCopy: (copy: BufferCopy) => unknown) => {
  const copyBufferNode = new AudioWorkletNode(context, 'copy-buffer-processor', { numberOfInputs: 1, numberOfOutputs: 1, processorOptions: { copyMode } });
  copyBufferNode.port.onmessage = (msg) => {
    onCopy(msg.data);
  };
  return copyBufferNode;
};

export const createPlayBufferNode = (context: AudioContext, buffer: Array<number>, onDone: () => unknown) => {
  const audioBuffer = context.createBuffer(1, buffer.length, context.sampleRate);
  const channel = audioBuffer.getChannelData(0);
  for (let i = 0; i < buffer.length; i++) {
    channel[i] = buffer[i];
  }

  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.onended = onDone;
  source.start();

  return source;
};

export const fooCurve: Array<number> = (() => {
  const curve: Array<number> = [];
  const f = (x: number) => Math.max(-1, Math.min(1, Math.asin(x)));
  const delta = 0.01;

  for (let x = -1 + delta; x < 0; x += delta) { curve.push(f(x)); }
  curve.push(f(0));
  for (let x = delta; x < 1; x += delta) { curve.push(f(x)) }

  return curve;
})();

export const createFooNode = (context: AudioContext): WaveShaperNode => {
  const shaperNode = context.createWaveShaper();
  shaperNode.curve = Float32Array.from(fooCurve);

  return shaperNode;
};

export const createFooBank = (context: AudioContext, frequencies: Array<number>, Q: number): [ChannelSplitterNode, ChannelMergerNode] => {
  const splitter = context.createChannelSplitter(frequencies.length);
  const filters = frequencies.map(frequency => new BiquadFilterNode(context, { type: 'bandpass', frequency, Q }));
  filters.forEach((filter, i) => splitter.connect(filter, i));

  const shapers = filters.map(filter => {
    const shaper = createFooNode(context)
    filter.connect(shaper);
    return shaper;
  });
  // const shapers = [...filters]; // FIXME madness goes here ;)

  const merger = context.createChannelMerger(filters.length);
  shapers.forEach((shaper, i) => shaper.connect(merger, undefined, i));

  return [splitter, merger];
};

export const createMicStream = async () => {
  const context = await createAudioContext();
  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  return context.createMediaStreamSource(audioStream);
};

export const createBestagonStream = memo(async () => {
  const selector = '#bestagons';
  const context = await createAudioContext();
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`Could not find element for selector '${selector}'!`);
  }

  if (!(element instanceof HTMLMediaElement)) {
    throw new Error(`Element for selector '${selector}' is not an HTMLMediaElement!`);
  }

  return context.createMediaElementSource(element);
});

export function* slidingWindows(data: Array<number>): Generator<Array<number>, void, unknown> {
  const iMax = data.length - bufferSize;
  for (let i = 0; i < iMax; i++) {
    yield data.slice(i, i + bufferSize);
  }
}

export function* bufferWindows(data: Array<number>): Generator<Array<number>, void, unknown> {
  const iMax = data.length - bufferSize;
  for (let i = 0; i < iMax; i += bufferSize) {
    yield data.slice(i, i + bufferSize);
  }
}

export const indexToFrequency = (context: AudioContext) => (i: number) => (i * (context.sampleRate / bufferSize));
// For some reason it looks more correct when graphing without the `/2`.
// export const indexToFrequency = (context: AudioContext) => (i: number) => (i * (context.sampleRate / bufferSize / 2));

export type FFTOutput = { imag: Float64Array, real: Float64Array };

export const fft = (data: Array<number>): FFTOutput => {
  const real = Float64Array.from(data);
  const imag = new Float64Array(data.length);
  transform(real, imag);
  return { real, imag };
}

export const qri = (data: Array<number>, qLevels: number, stride: number): Array<number> => {
  const strideData = data.filter((_, i) => ((i % stride) === 0));
  const quantizedStride = strideData.map(x => Math.round(x * qLevels) / qLevels);

  const ret: Array<number> = [];
  for (let i = 1; i < strideData.length; i++) {
    const a = quantizedStride[i - 1];
    const b = quantizedStride[i];
    const m = (b - a) / stride;

    for (let x = 0; x < stride; x++) {
      ret.push(m * x + a);
    }
  }

  return ret;
};
