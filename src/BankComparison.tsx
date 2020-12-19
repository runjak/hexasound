import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createCopyBufferNode, createFooBank,  createSimpleWaveNode } from './audio';
import Series from './Series';

type Props = { frequencies: Array<number>; bankFrequencies: Array<number>, Q: number };

const BankComparison: FC<Props> = ({ frequencies, bankFrequencies, Q }) => {
  const [inputSample, setInputSample] = useState<null | Array<number>>(null);
  const [outputSample, setOutputSample] = useState<null | Array<number>>(null);

  const playComparison = useCallback(async (playInput: boolean) => {
    const context = await createAudioContext();
    const take = 1000;

    const input = createSimpleWaveNode(context, 'sin', frequencies, 1);
    const takeInput = createCopyBufferNode(context, 'first', ({buffer}) => setInputSample(buffer.slice(0, take)));
    const [bankInput, bankOutput] = createFooBank(context, bankFrequencies, Q);
    const takeOutput = createCopyBufferNode(context, 'first', ({buffer}) => setOutputSample(buffer.slice(0,take)));
    const usedOutput = playInput ? takeInput : takeOutput;

    input.connect(takeInput);
    takeInput.connect(bankInput);
    bankOutput.connect(takeOutput)
    usedOutput.connect(context.destination);

    window.setTimeout(() => {
      input.disconnect(takeInput);
      usedOutput.disconnect(context.destination);
    }, 1000);
  }, [frequencies, bankFrequencies, Q, setInputSample, setOutputSample]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Series width={750} height={100} data={inputSample ?? []} onClick={() => playComparison(true)} />
      <span>➡️</span>
      <Series width={750} height={100} data={outputSample ?? []} onClick={() => playComparison(false)} />
    </div>
  );
};

export default BankComparison;
