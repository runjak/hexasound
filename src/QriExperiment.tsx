import React, { FC, useCallback, useState } from 'react';

import {
  createAudioContext,
  createBestagonStream,
  createCopyBufferNode,
  createMicStream,
  createPlayBufferNode,
  createSimpleWaveNode,
} from './audio';
import Series from './Series';

/*
  Experimenting with a node that does:
  - Quantization
  - Reduction of sample rate
  - interpolation
  All done in hope of seeing some bestagons.
*/
const QriExperiment: FC = () => {
  const [playbackBuffer, setPlaybackBuffer] = useState<Array<number>>([]);
  const [recordingSample, setRecordingSample] = useState<Array<number>>([]);
  const [playbackSample, setPlaybackSample] = useState<Array<number>>([]);

  const doPlay = useCallback(async (input: AudioNode) => {
    const context = await createAudioContext();
    const takeInput = createCopyBufferNode(context, 'first', ({ buffer }) => setRecordingSample(buffer));
    let playbackData: Array<number> = [];
    const takeAllInput = createCopyBufferNode(context, 'all',
      ({ buffer, channelIndex, inputIndex }) => {
        if (inputIndex === 0 && channelIndex === 0) {
          playbackData.push(...buffer);
        }
      },
    );

    input.connect(takeInput);
    takeInput.connect(takeAllInput);
    takeAllInput.connect(context.destination);

    window.setTimeout(() => {
      input.disconnect(takeInput);
      takeInput.disconnect(takeAllInput);
      takeAllInput.disconnect(context.destination);
      setPlaybackBuffer(playbackData.slice());
    }, 1000);
  }, [setPlaybackBuffer, setRecordingSample]);

  const playD = useCallback(async () => {
    const context = await createAudioContext();
    doPlay(createSimpleWaveNode(context, 'sin', [294], .5));
  }, [doPlay]);
  const playA = useCallback(async () => {
    const context = await createAudioContext();
    doPlay(createSimpleWaveNode(context, 'sin', [440], .5));
  }, [doPlay]);
  const playDA = useCallback(async () => {
    const context = await createAudioContext();
    doPlay(createSimpleWaveNode(context, 'sin', [294, 440], .5));
  }, [doPlay]);
  const playBestagons = useCallback(async () => {
    const bestagonStream = await createBestagonStream();
    doPlay(bestagonStream);
  }, [doPlay]);
  const playMic = useCallback(async () => {
    const input = await createMicStream();
    doPlay(input);
  }, [doPlay]);

  const onPlayback = useCallback(async () => {
    const context = await createAudioContext();
    const takeInput = createCopyBufferNode(context, 'first', ({ buffer }) => setPlaybackSample(buffer));
    const input = createPlayBufferNode(context, playbackBuffer, () => {
      input.disconnect(takeInput);
      takeInput.disconnect(context.destination);
    });

    input.connect(takeInput);
    takeInput.connect(context.destination);
  }, [playbackBuffer, setPlaybackSample]);

  return (
    <>
      <h3>Record buttons:</h3>
      <div>
        <button onClick={playD}>D294</button>
        <button onClick={playA}>A440</button>
        <button onClick={playDA}>D294 + A440</button>
        <button onClick={playBestagons}>Bestagons</button>
        <button onClick={playMic}>Mic</button>
      </div>
      <Series height={200} width={900} data={recordingSample} />
      <h3>Playback:</h3>
      <button onClick={onPlayback}>Play</button>
      <Series height={200} width={900} data={playbackSample} />
    </>
  );
};

export default QriExperiment;
