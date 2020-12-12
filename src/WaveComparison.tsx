import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createFrequenciesNode, createTakeFirstSampleNode, waves } from './audio';
import Series from './Series';

type Props = {frequencies: Array<number>};

const WaveComparison: FC<Props> = ({frequencies}) => {
  const [inputSample, setInputSample] = useState<null | Array<number>>(null);
  const [outputSample, setOutputSample] = useState<null | Array<number>>(null);

  const doSample = useCallback(() => {
    const audioContext = createAudioContext();

    const input = createFrequenciesNode(audioContext, waves.sin, frequencies, 0.4);
    const takeInput = createTakeFirstSampleNode(audioContext, setInputSample);
    const waveShaping = audioContext.createWaveShaper();
    const takeOutput = createTakeFirstSampleNode(audioContext, setOutputSample);

    input.connect(takeInput);
    takeInput.connect(waveShaping);
    waveShaping.connect(takeOutput);
    takeOutput.connect(audioContext.destination);

    window.setTimeout(() => {
      input.disconnect(takeInput);
      takeOutput.disconnect(audioContext.destination);
    }, 1000);
  }, [setInputSample, setOutputSample, frequencies]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Series width={750} height={100} data={inputSample ?? []} onClick={doSample} />
      <span>➡️</span>
      <Series width={750} height={100} data={outputSample ?? []} onClick={doSample} />
    </div>
  );
};

export default WaveComparison;