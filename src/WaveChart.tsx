import React, { FC, useCallback, useMemo } from 'react';

import { waves, Wave, WaveName, createAudioContext, createSimpleWaveNode } from './audio';
import Series from './Series';

const useWaveData = (wave: Wave): Array<number> => (useMemo(() => {
  const xMax = Math.PI * 2;
  const xDelta = Math.PI / 40;

  const data: Array<number> = [];
  for (let x = 0; x < xMax; x += xDelta) {
    data.push(wave(x));
  }

  return data;
}, [wave]));

type Props = { waveName: WaveName };

const WaveChart: FC<Props> = ({ waveName }) => {
  const waveData = useWaveData(waves[waveName]);

  const playWave = useCallback(async () => {
    const audioContext = await createAudioContext();
    const a = createSimpleWaveNode(audioContext, waveName, [440], 0.1);

    a.connect(audioContext.destination);

    window.setTimeout(() => { a.disconnect(audioContext.destination) }, 1000);
  }, [waveName]);

  return (
    <div>
      <h2>{waveName}</h2>
      <Series width={200} height={125} data={waveData} onClick={playWave} />
    </div>
  )
};

export default WaveChart;
