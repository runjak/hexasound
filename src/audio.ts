const AudioContext = window.AudioContext;

export const createContext = () => new AudioContext();

const bufferSize = 4096;

export const createSinusNode = (context: AudioContext, frequency: number, amplitude: number): ScriptProcessorNode => {
  const scriptNode = context.createScriptProcessor(bufferSize, 0, 1);
  const delta = 1 / context.sampleRate;
  let t = 0;

  scriptNode.onaudioprocess = (audioProcessingEvent: AudioProcessingEvent): void => {
    const { outputBuffer } = audioProcessingEvent;
    const channelData = outputBuffer.getChannelData(0);

    for (let i = 0; i < outputBuffer.length; i++) {
      t += delta;
      channelData[i] = Math.sin(Math.PI * 2 * (t * frequency)) * amplitude;
    }
  };

  return scriptNode;
};
