import React, { FC, useCallback, useState } from 'react';
import FrequencyGraph from './FrequencyGraph';
import { createAudioContext, createBestagonStream } from './audio';

import WaveChart from './WaveChart';
import WaveformGraph from './WaveformGraph';
import WaveComparison from './WaveComparison';

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
      <h1>Bestagons</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: `${5 * 210}px` }}>
        <WaveChart waveName="sin" />
        <WaveChart waveName="square" />
        <WaveChart waveName="sawtooth" />
        <WaveChart waveName="triangle" />
        <WaveChart waveName="hex" />
      </div>
      <h2>Comparison A440</h2>
      <WaveComparison frequencies={[440]}/>
      <h2>Comparison D294</h2>
      <WaveComparison frequencies={[294]}/>
      <h2>Comparison D294 + A440</h2>
      <WaveComparison frequencies={[294, 440]}/>
      <h2>bestagons.wav</h2>
      <audio controls src="./bestagons.wav" id="bestagons" />
      {(analyser !== null) ? (<><FrequencyGraph analyser={analyser} /><WaveformGraph analyser={analyser}></WaveformGraph></>) : (<button onClick={onClick}>Do a thing!</button>)}
    </div>
  );
}

export default App;
