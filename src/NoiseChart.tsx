import React, { FC, useCallback, useMemo } from 'react';

import { createAudioContext, createNoiseNode } from './audio';
import Series from './Series';

const useNoiseData = (): Array<number> => (useMemo(() => {
  const xMax = Math.PI * 2;
  const xDelta = Math.PI / 40;

  const data: Array<number> = [];
  for (let x = 0; x < xMax; x += xDelta) {
    data.push(Math.random() * 2 - 1);
  }

  return data;
}, []));

const NoiseChart: FC = () => {
  const noiseData = useNoiseData();
  const playNoise = useCallback(async () => {
    const context = await createAudioContext();
    const noise = createNoiseNode(context, 0.3);

    noise.connect(context.destination);

    window.setTimeout(() => { noise.disconnect(context.destination) }, 1000);
  }, []);

  return (
    <div>
      <h2>noise</h2>
      <Series width={200} height={125} data={noiseData} onClick={playNoise} />
    </div>
  )
};

export default NoiseChart;
