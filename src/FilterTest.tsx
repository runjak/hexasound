import React, { FC, useCallback, useMemo, useState } from 'react';
import { range, zipWith } from 'lodash';

import { createAudioContext } from './audio';
import MultiSeries, { MultiSeriesData } from './MultiSeries';

type FilterProps = { filters: Array<BiquadFilterNode> };

const hearingStart = 20;
const hearingEnd = 20000;

const FilterComparison: FC<FilterProps> = ({ filters }) => {
  const [magData, phaseData]: [MultiSeriesData, MultiSeriesData] = useMemo(() => {
    const magData: MultiSeriesData = [];
    const phaseData: MultiSeriesData = [];

    const startValue = hearingStart
    const endValue = hearingEnd + 1;
    const testFrequencies = Float32Array.from(range(startValue, endValue, 10));
    const magThing = new Float32Array(testFrequencies.length);
    const phaseThing = new Float32Array(testFrequencies.length);

    const magResponse = new Float32Array(testFrequencies.length);
    const phaseResponse = new Float32Array(testFrequencies.length);
    filters.forEach(filter => {
      filter.getFrequencyResponse(testFrequencies, magResponse, phaseResponse);

      magData.push(zipWith(testFrequencies, magResponse, (x, y) => ({ x, y })));
      phaseData.push(zipWith(testFrequencies, phaseResponse, (x, y) => ({ x, y })));
      for (let i = 0; i < testFrequencies.length; i++) {
        magThing[i] += magResponse[i];
        phaseThing[i] -= phaseResponse[i];
      }
    });

    magData.unshift(zipWith(testFrequencies, magThing, (x, y) => ({ x, y })));
    phaseData.unshift(zipWith(testFrequencies, phaseThing, (x, y) => ({ x, y })));

    return [magData, phaseData];
  }, [filters])

  return (
    <div>
      <h3>Amplitudes</h3>
      <MultiSeries width={800} height={400} data={magData} />
      <h3>Phases</h3>
      <MultiSeries width={800} height={400} data={phaseData} />
    </div>
  );
};

const FilterTest: FC = () => {
  const [frequencies, setFrequencies] = useState<Array<number>>([100, 440]);
  const [Q, setQ] = useState<number>(1);
  const [filters, setFilters] = useState<Array<BiquadFilterNode> | null>(null);

  const doThing = useCallback(() => {
    const audioContext = createAudioContext();
    setFilters(frequencies.map(frequency => (new BiquadFilterNode(audioContext, { type: 'bandpass', frequency, Q }))));
  }, [frequencies, Q, setFilters]);

  return (
    <div>
      <input pattern="[\.,+-\d]+" value={frequencies.join(', ')} onChange={(event) => setFrequencies(event.target.value.split(',').map(s => Number(s)))} />
      <input type="number" value={Q} onChange={(event) => setQ(Number(event.target.value))} />
      <button onClick={doThing}>Do the thing!</button>
      <FilterComparison filters={filters || []} />
    </div>
  );
};

export default FilterTest;
