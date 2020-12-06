import React, { FC, useCallback, useState } from 'react';
import FrequencyGraph from './FrequencyGraph';
import { createAudioContext, createBestagonStream } from './audio';

import PlayButtons from './PlayButtons';
import WaveChart from './WaveChart';

const App: FC = () => {
  const [analyser, setAnalyser] = useState<null | AnalyserNode>(null);

  const onClick = useCallback(() => {
    const audioContext = createAudioContext();

    const analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = 256;

    const source = createBestagonStream();
    source.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    setAnalyser(analyserNode);
  }, [setAnalyser]);

  return (
    <div>
      <PlayButtons />
      <br />
      <WaveChart />
      <br />
      <h1>bestagons.wav</h1>
      <audio controls src="./bestagons.wav" id="bestagons" />
      {(analyser !== null) ? (<FrequencyGraph analyser={analyser} />) : (<button onClick={onClick}>Do a thing!</button>)}
    </div>
  );
}

export default App;
