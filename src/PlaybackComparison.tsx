import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createBestagonStream, createFrequenciesNode, createMicStream, createPlayArrayNode, createTakeAllNode, createTakeSampleNode, waves } from './audio';
import Series from './Series';

const takeSize = 1000;

const PlaybackComparison: FC = () => {
  const [playbackBuffer, setPlaybackBuffer] = useState<Array<number>>([]);
  const [recordingSample, setRecordingSample] = useState<null | Array<number>>(null);
  const [playbackSample, setPlaybackSample] = useState<null | Array<number>>(null);

  const doPlay = useCallback((input: AudioNode) => {
    const context = createAudioContext();
    const takeInput = createTakeSampleNode(context, data => (setRecordingSample(data.slice(0, takeSize))));
    const [playbackData, takeAllInput] = createTakeAllNode(context);

    input.connect(takeInput);
    takeInput.connect(takeAllInput);
    takeAllInput.connect(context.destination);

    window.setTimeout(() => {
      input.disconnect(takeInput);
      takeInput.disconnect(takeAllInput);
      takeAllInput.disconnect(context.destination);
      setPlaybackBuffer(playbackData);
    }, 1000);
  }, [setPlaybackBuffer, setRecordingSample]);

  const playD = useCallback(() => {
    doPlay(createFrequenciesNode(createAudioContext(), waves.sin, [294], .5));
  }, [doPlay]);
  const playA = useCallback(() => {
    doPlay(createFrequenciesNode(createAudioContext(), waves.sin, [440], .5));
  }, [doPlay]);
  const playDA = useCallback(() => {
    doPlay(createFrequenciesNode(createAudioContext(), waves.sin, [294, 440], .5));
  }, [doPlay]);
  const playBestagons = useCallback(() => {
   doPlay(createBestagonStream()) ;
  }, [doPlay]);
  const playMic = useCallback(async () => {
   const input = await createMicStream();
   doPlay(input);
  }, [doPlay]);

  const onPlayback = useCallback(() => {
    const context = createAudioContext();
    const takeInput = createTakeSampleNode(context, (data) => setPlaybackSample(data.slice(0, takeSize)));
    const input = createPlayArrayNode(context, playbackBuffer, () => {
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
      <Series height={100} width={750} data={recordingSample ?? []} />
      <h3>Playback:</h3>
      <button onClick={onPlayback}>Play</button>
      <Series height={100} width={750} data={playbackSample ?? []} />
    </>
  );
};

export default PlaybackComparison;
