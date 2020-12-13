import React, { FC, useCallback, useMemo, useState } from 'react';
import { range, zipWith } from 'lodash';

import { createAudioContext } from './audio';
import Series from './Series';

type FilterProps = { firstFilter: BiquadFilterNode, secondFilter: BiquadFilterNode };

const FilterComparison: FC<FilterProps> = ({ firstFilter, secondFilter }) => {
  const { normalisedMagResponse } = useMemo(() => {
    const startValue = firstFilter.frequency.value;
    const endValue = secondFilter.frequency.value + 1;
    const testFrequencies = Float32Array.from(range(startValue, endValue));

    const firstMagResponse = new Float32Array(testFrequencies.length);
    const firstPhaseResponse = new Float32Array(testFrequencies.length);
    firstFilter.getFrequencyResponse(testFrequencies, firstMagResponse, firstPhaseResponse);

    const secondMagResponse = new Float32Array(testFrequencies.length);
    const secondPhaseResponse = new Float32Array(testFrequencies.length);
    secondFilter.getFrequencyResponse(testFrequencies, secondMagResponse, secondPhaseResponse);

    const combinedMagResponse = zipWith(firstMagResponse, secondMagResponse, (x, y) => (x + y));
    const maxMagResponse = Math.max(...combinedMagResponse.map(x => Math.abs(x)));
    const normalisedMagResponse = combinedMagResponse.map(x => x / maxMagResponse);

    const combinedPhaseResponse = zipWith(firstPhaseResponse, secondPhaseResponse, (x, y) => Math.abs(x) < Math.abs(y) ? x : y);

    console.table(zipWith(
      testFrequencies, combinedMagResponse, combinedPhaseResponse,
      (frequency, combinedMag, combinedPhase) => ({ frequency, combinedMag: combinedMag.toFixed(4), combinedPhase: combinedPhase.toFixed(4) }),
    ));

    return { normalisedMagResponse };
  }, [firstFilter, secondFilter])

  return (
    <div>
      <Series width={750} height={100} data={normalisedMagResponse} />
    </div>
  );
};

const FilterTest: FC = () => {
  const [firstFreq, setFirstFreq] = useState<number>(5);
  const [secondFreq, setSecondFreq] = useState<number>(20);
  const freqDelta = secondFreq - firstFreq;
  const [q, setQ] = useState<number>(1);
  const [filterPair, setFilterPair] = useState<[BiquadFilterNode, BiquadFilterNode] | null>(null);

  const doThing = useCallback(() => {
    const audioContext = createAudioContext();
    const firstFilter = new BiquadFilterNode(audioContext, { type: 'bandpass', frequency: firstFreq, Q: q });
    const secondFilter = new BiquadFilterNode(audioContext, { type: 'bandpass', frequency: secondFreq, Q: q });

    setFilterPair([firstFilter, secondFilter]);
  }, [firstFreq, secondFreq, q, setFilterPair]);

  return (
    <div>
      <input type="number" value={firstFreq} onChange={(event) => setFirstFreq(Number(event.target.value))} />
      <input type="number" value={secondFreq} onChange={(event) => setSecondFreq(Number(event.target.value))} />
      <input type="number" value={q} onChange={(event) => setQ(Number(event.target.value))} />
      <button onClick={doThing}>Do the thing!</button>
      <button onClick={() => { setFirstFreq(firstFreq - freqDelta); setSecondFreq(secondFreq - freqDelta); }}>⬅️</button>
      <button onClick={() => { setFirstFreq(firstFreq + freqDelta); setSecondFreq(secondFreq + freqDelta); }}>➡️</button>
      {(filterPair !== null) && (<FilterComparison firstFilter={filterPair[0]} secondFilter={filterPair[1]} />)}
    </div>
  );
};

export default FilterTest;
