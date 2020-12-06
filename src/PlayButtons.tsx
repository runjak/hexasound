import React, { FC, useCallback } from 'react';

import { createAudioContext, waves, createFrequencyNode, WaveName, } from './audio';

const PlayButtons: FC = () => {
  const playWave = useCallback((waveName: WaveName) => {
    const audioContext = createAudioContext();
    const a = createFrequencyNode(audioContext, waves[waveName], 440, 0.1);

    a.connect(audioContext.destination);

    window.setTimeout(() => { a.disconnect(audioContext.destination) }, 1000);
  }, []);

  return (
    <>
      {Object.keys(waves).map((waveName) => (
        <button key={'play-' + waveName} onClick={() => playWave(waveName as WaveName)}>{waveName}</button>
      ))}
    </>
  );
};

export default PlayButtons;
