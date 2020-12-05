import React, { FC, useCallback } from 'react';

import { createContext, waves, createFrequencyNode, WaveName, } from './audio';

const App: FC = () => {
  const playWave = useCallback((waveName: WaveName) => {
    const audioContext = createContext();
    const a = createFrequencyNode(audioContext, waves[waveName], 440, 0.1);

    a.connect(audioContext.destination);

    window.setTimeout(() => { a.disconnect(audioContext.destination) }, 1000);
  }, []);

  return (
    <div>
      {Object.keys(waves).map((waveName) => (
        <button key={'play-' + waveName} onClick={() => playWave(waveName as WaveName)}>{waveName}</button>
      ))}
    </div>
  );
}

export default App;
