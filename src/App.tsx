import React, { FC, useCallback, useState } from 'react';
import FrequencyGraph from './FrequencyGraph';
import { createAudioContext, createBestagonStream } from './audio';

import WaveChart from './WaveChart';
import WaveformGraph from './WaveformGraph';

const App: FC = () => {
  const [analyser, setAnalyser] = useState<null | AnalyserNode>(null);

  const onClick = useCallback(() => {
    const audioContext = createAudioContext();

    const analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = 1024;

    const source = createBestagonStream();
    source.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    setAnalyser(analyserNode);
  }, [setAnalyser]);

  return (
    <div>
      <WaveChart waveName="sin" />
      <WaveChart waveName="square" />
      <WaveChart waveName="sawtooth" />
      <WaveChart waveName="triangle" />
      <WaveChart waveName="hex" />
      <br />
      <h1>bestagons.wav</h1>
      <audio controls src="./bestagons.wav" id="bestagons" />
      {(analyser !== null) ? (<><FrequencyGraph analyser={analyser} /><WaveformGraph analyser={analyser}></WaveformGraph></>) : (<button onClick={onClick}>Do a thing!</button>)}
    </div>
  );
}

export default App;
