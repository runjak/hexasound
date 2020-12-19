import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createCopyBufferNode, createFooNode, createSimpleWaveNode } from './audio';
import Series from './Series';

type Props = { frequencies: Array<number> };

const WaveComparison: FC<Props> = ({ frequencies }) => {
  const [inputSample, setInputSample] = useState<null | Array<number>>(null);
  const [outputSample, setOutputSample] = useState<null | Array<number>>(null);

  const playComparison = useCallback(async (playInput: boolean) => {
    const context = await createAudioContext();
    const take = 1000;

    const input = createSimpleWaveNode(context, 'sin', frequencies, 1);
    const takeInput = createCopyBufferNode(context, 'first', ({buffer}) => setInputSample(buffer.slice(0,take)))
    const waveShaping = createFooNode(context);
    const takeOutput = createCopyBufferNode(context, 'first', ({buffer}) => setOutputSample(buffer.slice(0, take)));
    const usedOutput = playInput ? takeInput : takeOutput;

    input.connect(takeInput);
    takeInput.connect(waveShaping);
    waveShaping.connect(takeOutput);
    usedOutput.connect(context.destination);

    window.setTimeout(() => {
      input.disconnect(takeInput);
      usedOutput.disconnect(context.destination);
    }, 1000);
  }, [setInputSample, setOutputSample, frequencies]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Series width={750} height={100} data={inputSample ?? []} onClick={() => playComparison(true)} />
      <span>➡️</span>
      <Series width={750} height={100} data={outputSample ?? []} onClick={() => playComparison(false)} />
    </div>
  );
};

export default WaveComparison;
