import React, { FC, useCallback, useMemo } from 'react';

import { createAudioContext } from './audio';
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
    const audioContext = await createAudioContext();
    const noise = new AudioWorkletNode(audioContext, 'white-noise-processor');

    noise.connect(audioContext.destination);

    window.setTimeout(() => { noise.disconnect(audioContext.destination) }, 1000);
  }, []);

  return (
    <div>
      <h2>Noise</h2>
      <Series width={200} height={125} data={noiseData} onClick={playNoise} />
    </div>
  )
};

export default NoiseChart;
