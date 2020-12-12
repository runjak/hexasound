import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createBestagonStream, createFooNode, createTakeSampleNode } from './audio';
import Series from './Series';

const BestagonComparison: FC = () => {
  const [inputSample, setInputSample] = useState<null | Array<number>>(null);
  const [outputSample, setOutputSample] = useState<null | Array<number>>(null);

  const playComparison = useCallback(() => {
    const audioContext = createAudioContext();

    const take = 1000;
    const input = createBestagonStream();
    const takeInput = createTakeSampleNode(audioContext, data => setInputSample(data.slice(0, take)));
    const waveShaping = createFooNode(audioContext);
    const takeOutput = createTakeSampleNode(audioContext, data => setOutputSample(data.slice(0, take)));

    input.connect(takeInput);
    takeInput.connect(waveShaping);
    waveShaping.connect(takeOutput);
    takeOutput.connect(audioContext.destination);
  }, [setInputSample, setOutputSample]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Series width={750} height={100} data={inputSample ?? []} onClick={playComparison} />
      <span>➡️</span>
      <Series width={750} height={100} data={outputSample ?? []} onClick={playComparison} />
    </div>
  );
};

export default BestagonComparison;
