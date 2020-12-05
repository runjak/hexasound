import React, { FC } from 'react';

import { waves, Wave } from './audio';

const chartWave = (wave: Wave): string => {
  const size = '200x125'
  const color = '76A4FB'
  const delta = Math.PI / 10;
  const iMax = Math.PI * 2;

  const data = [];
  for (let i = 0; i <= iMax; i += delta) {
    data.push(wave(i) * 50 + 50);
  }

  return `https://chart.googleapis.com/chart?cht=lc&chs=${size}&chco=${color}&chd=t:${data.join(',')}`;
};

const WaveChart: FC = () => {
  return (
    <div>
    {Object.entries(waves).map(([waveName, wave]) => (
      <div key={`wave-char-${waveName}`}>
        <h3>{waveName}</h3>
        <img src={chartWave(wave)} />
      </div>
    ))}
    </div>
  )
};

export default WaveChart;
