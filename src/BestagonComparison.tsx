import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createBestagonStream, createCopyBufferNode, createFooNode } from './audio';
import Series from './Series';

const BestagonComparison: FC = () => {
  const [inputSample, setInputSample] = useState<null | Array<number>>(null);
  const [outputSample, setOutputSample] = useState<null | Array<number>>(null);

  const playComparison = useCallback(async () => {
    const context = await createAudioContext();
    const take = 1000;

    const input = await createBestagonStream();
    const takeInput = createCopyBufferNode(context, 'first', ({ buffer }) => setInputSample(buffer.slice(0, take)));
    const waveShaping = createFooNode(context);
    const takeOutput = createCopyBufferNode(context, 'first', ({ buffer }) => setOutputSample(buffer.slice(0, take)));

    input.connect(takeInput);
    takeInput.connect(waveShaping);
    waveShaping.connect(takeOutput);
    takeOutput.connect(context.destination);
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
