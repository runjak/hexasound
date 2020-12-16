import React, { FC, useCallback, useState } from 'react';
import { createAudioContext, createFooBank, createFrequenciesNode, createTakeSampleNode, waves } from './audio';
import Series from './Series';

type Props = { frequencies: Array<number>; bankFrequencies: Array<number>, Q: number };

const BankComparison: FC<Props> = ({ frequencies, bankFrequencies, Q }) => {
  const [inputSample, setInputSample] = useState<null | Array<number>>(null);
  const [outputSample, setOutputSample] = useState<null | Array<number>>(null);

  const playComparison = useCallback(async (playInput: boolean) => {
    const audioContext = await createAudioContext();

    const take = 1000;
    const input = createFrequenciesNode(audioContext, waves.sin, frequencies, 1);
    const takeInput = createTakeSampleNode(audioContext, data => setInputSample(data.slice(0, take)));
    const [bankInput, bankOutput] = createFooBank(audioContext, bankFrequencies, Q);
    const takeOutput = createTakeSampleNode(audioContext, data => setOutputSample(data.slice(0, take)));
    const usedOutput = playInput ? takeInput : takeOutput;

    input.connect(takeInput);
    takeInput.connect(bankInput);
    bankOutput.connect(takeOutput)
    usedOutput.connect(audioContext.destination);

    window.setTimeout(() => {
      input.disconnect(takeInput);
      usedOutput.disconnect(audioContext.destination);
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
