import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createFrequenciesNode, createTakeFirstSampleNode, waves } from './audio';
import Series from './Series';

type Props = {};

const WaveComparison: FC<Props> = () => {
  const [inputSample, setInputSample] = useState<null | Array<number>>(null);
  const [outputSample, setOutputSample] = useState<null | Array<number>>(null);

  const doSample = useCallback(() => {
    const audioContext = createAudioContext();

    const input = createFrequenciesNode(audioContext, waves.sin, [440], 0.1);
    const takeInput = createTakeFirstSampleNode(audioContext, setInputSample);
    const waveShaping = audioContext.createWaveShaper();
    const takeOutput = createTakeFirstSampleNode(audioContext, setOutputSample);

    input.connect(takeInput);
    takeInput.connect(waveShaping);
    waveShaping.connect(takeOutput);
    takeOutput.connect(audioContext.destination);

    window.setTimeout(() => { takeOutput.disconnect(audioContext.destination) }, 1000);
  }, [setInputSample, setOutputSample]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Series width={400} height={100} data={inputSample ?? []} onClick={doSample} />
      <span>➡️</span>
      <Series width={400} height={100} data={outputSample ?? []} onClick={doSample} />
    </div>
  );
};

export default WaveComparison;
