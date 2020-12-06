import React, { FC, useCallback } from 'react';
import { parseJsonSourceFileConfigFileContent } from 'typescript';
import { createAudioContext, createBestagonStream } from './audio';

import PlayButtons from './PlayButtons';
import WaveChart from './WaveChart';

const App: FC = () => {
  const onClick = useCallback(() => {
    const audioContext = createAudioContext();

    const analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = 256;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const source = createBestagonStream();
    source.connect(analyserNode);
    analyserNode.connect(audioContext.destination);

    console.log(bufferLength, dataArray);
  }, []);

  return (
    <div>
      <PlayButtons />
      <br />
      <WaveChart />
      <br />
      <h1>bestagons.wav</h1>
      <audio controls src="./bestagons.wav" id="bestagons" />
      <button onClick={onClick}>Do a thing!</button>
    </div>
  );
}

export default App;
