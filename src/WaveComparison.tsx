import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createFooNode, createFrequenciesNode, createTakeSampleNode, waves } from './audio';
import Series from './Series';

type Props = { frequencies: Array<number> };

const WaveComparison: FC<Props> = ({ frequencies }) => {
  const [inputSample, setInputSample] = useState<null | Array<number>>(null);
  const [outputSample, setOutputSample] = useState<null | Array<number>>(null);

  const doSample = useCallback(() => {
    const audioContext = createAudioContext();

    const take = 1000;
    const input = createFrequenciesNode(audioContext, waves.sin, frequencies, 1);
    const takeInput = createTakeSampleNode(audioContext, data => setInputSample(data.slice(0, take)));
    const waveShaping = createFooNode(audioContext);
    const takeOutput = createTakeSampleNode(audioContext, data => setOutputSample(data.slice(0, take)));

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
