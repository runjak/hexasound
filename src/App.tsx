import React, { FC, useCallback, useState } from 'react';
import FrequencyGraph from './FrequencyGraph';
import { createAudioContext, createBestagonStream, fooCurve } from './audio';

import WaveChart from './WaveChart';
import WaveformGraph from './WaveformGraph';
import WaveComparison from './WaveComparison';
import Series from './Series';
import BestagonComparison from './BestagonComparison';
import FilterTest from './FilterTest';

const App: FC = () => {
  return (
    <div>
      <h1>Bestagons</h1>
      <h2>Wave forms</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: `${5 * 210}px` }}>
        <WaveChart waveName="sin" />
        <WaveChart waveName="square" />
        <WaveChart waveName="sawtooth" />
        <WaveChart waveName="triangle" />
        <WaveChart waveName="hex" />
      </div>
      <h2>Filters</h2>
      <FilterTest />
      <h2>ShapeCurve</h2>
      <Series width={200} height={200} data={fooCurve} />
      <h2>Comparison A440</h2>
      <WaveComparison frequencies={[440]} />
      <h2>Comparison D294</h2>
      <WaveComparison frequencies={[294]} />
      <h2>Comparison D294 + A440</h2>
      <WaveComparison frequencies={[294, 440]} />
      <h2>bestagons.wav</h2>
      <audio controls src="./bestagons.wav" id="bestagons" />
      <BestagonComparison />
    </div>
  );
}

export default App;
