import React, { FC, useCallback, useMemo } from 'react';

import { waves, Wave, WaveName, createAudioContext, createFrequenciesNode } from './audio';
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
  const wave = waves[waveName];
  const waveData = useWaveData(wave);

  const playWave = useCallback(() => {
    const audioContext = createAudioContext();
    const a = createFrequenciesNode(audioContext, wave, [440], 0.1);

    a.connect(audioContext.destination);

    window.setTimeout(() => { a.disconnect(audioContext.destination) }, 1000);
  }, [wave]);

  return (
    <div>
      <h2>{waveName}</h2>
      <Series width={200} height={125} data={waveData} onClick={playWave} />
    </div>
  )
};

export default WaveChart;
