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

export const createAudioContext = memo(() => new AudioContext());

const bufferSize = 4096;

export type Wave = (radians: number) => number;

const sin: Wave = Math.sin;

const square: Wave = (radians) => Math.sign(Math.sin(radians))

const sawtooth: Wave = (radians) => ((radians % Math.PI) / Math.PI * 2) - 1;

const triangle_: Wave = (radians) => Math.asin(Math.sin(radians));

const triangle: Wave = (radians) => triangle_(radians) / (Math.PI / 2);

const hex: Wave = (radians) => Math.min(1, Math.max(triangle_(radians), -1));

export const waves = { sin, square, sawtooth, triangle, hex };

export type WaveName = keyof typeof waves;

export const createFrequenciesNode = (context: AudioContext, wave: Wave, frequencies: Array<number>, amplitude: number): ScriptProcessorNode => {
  const scriptNode = context.createScriptProcessor(bufferSize, 0, 1);
  const delta = 1 / context.sampleRate;
  let t = 0;

  scriptNode.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent): void => {
    const { outputBuffer } = audioProcessingEvent;
    const channelData = outputBuffer.getChannelData(0);

    for (let i = 0; i < outputBuffer.length; i++) {
      t += delta;
      channelData[i] = 0
      for (let j = 0; j < frequencies.length; j++) {
        const frequency = frequencies[j];
        channelData[i] += wave(Math.PI * 2 * (t * frequency)) * amplitude;
      }
      channelData[i] /= frequencies.length;
    }
  };

  return scriptNode;
};

export const createTakeFirstSampleNode = (context: AudioContext, take: (data: Array<number>) => unknown): ScriptProcessorNode => {
  const scriptNode = context.createScriptProcessor(bufferSize, 1, 1);

  let first = true;

  scriptNode.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent): void => {
    const { inputBuffer, outputBuffer } = audioProcessingEvent;
    const inputData = inputBuffer.getChannelData(0);

    take(Array.from(inputData));

    const outputData = outputBuffer.getChannelData(0);
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i];
    }
  };

  return scriptNode;
};

export const createMicStream = async () => {
  const audioContext = createAudioContext();
  const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  return audioContext.createMediaStreamSource(audioStream);
};

export const createBestagonStream = memo(() => {
  const selector = '#bestagons';
  const audioContext = createAudioContext();
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`Could not find element for selector '${selector}'!`);
  }

  if (!(element instanceof HTMLMediaElement)) {
    throw new Error(`Element for selector '${selector}' is not an HTMLMediaElement!`);
  }

  return audioContext.createMediaElementSource(element);
});
