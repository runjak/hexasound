const AudioContext = window.AudioContext;

export const createContext = () => new AudioContext();

const bufferSize = 4096;

export type Wave = (radians: number) => number;

const sin: Wave = Math.sin;

const abs: Wave = Math.abs;

const hex: Wave = (radians: number): number => {
  const alpha = radians / (Math.PI * 2);
  const sign = alpha > Math.PI ? -1 : 1;

  return sign;
};

export const waves = { sin, abs, hex };

export type WaveName = keyof typeof waves;

export const createFrequencyNode = (context: AudioContext, wave: Wave, frequency: number, amplitude: number): ScriptProcessorNode => {
  const scriptNode = context.createScriptProcessor(bufferSize, 0, 1);
  const delta = 1 / context.sampleRate;
  let t = 0;

  scriptNode.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent): void => {
    const { outputBuffer } = audioProcessingEvent;
    const channelData = outputBuffer.getChannelData(0);

    for (let i = 0; i < outputBuffer.length; i++) {
      t += delta;
      channelData[i] = wave(Math.PI * 2 * (t * frequency)) * amplitude;
    }
  };

  return scriptNode;
};
