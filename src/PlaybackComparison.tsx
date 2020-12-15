import React, { FC, useCallback, useEffect, useState } from 'react';

import { fft } from 'audio-fns';

import {
  bufferWindows,
  createAudioContext,
  createBestagonStream,
  createFrequenciesNode,
  createMicStream,
  createPlayArrayNode,
  createTakeAllNode,
  createTakeSampleNode,
  FFTOutput,
  waves,
} from './audio';
import Series from './Series';
import { HeatmapSeries, XAxis, XYPlot, YAxis } from 'react-vis';

const takeSize = 1000;

const exampleData = [
  { x: 1, y: 0, color: 10 },
  { x: 1, y: 5, color: 10 },
  { x: 1, y: 10, color: 6 },
  { x: 1, y: 15, color: 7 },
  { x: 2, y: 0, color: 12 },
  { x: 2, y: 5, color: 2 },
  { x: 2, y: 10, color: 1 },
  { x: 2, y: 15, color: 12 },
  { x: 3, y: 0, color: 9 },
  { x: 3, y: 5, color: 2 },
  { x: 3, y: 10, color: 6 },
  { x: 3, y: 15, color: 12 }
];

type HeatmapPoint = { x: number, y: number, color: number };
type HeatmapData = Array<HeatmapPoint>;

const toHeatmapData = (protoData: Array<FFTOutput>): HeatmapData => {
  return protoData.flatMap((row: FFTOutput, y: number): HeatmapData => (
    Array.from(row.real).slice(0, 500).map((color, x) => ({ x, y, color: Math.abs(color) })))
  );
};

const Waterfall: FC<{ data: Array<number> }> = ({ data }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData>(exampleData);
  useEffect(() => {
    let finishedInTime = true;

    const protoData: Array<FFTOutput> = [];
    Array.from(bufferWindows(data)).forEach((w) => {
      protoData.push(fft(Float64Array.from(w)));
    });

    if (finishedInTime) {
      const heatmapData = toHeatmapData(protoData);
      setHeatmapData(heatmapData);
      console.log('finishedInTime', protoData, heatmapData);
    }

    return () => {
      finishedInTime = false;
    };
  }, [data]);

  return (
    <div>
      <XYPlot width={750} height={750}>
        <XAxis />
        <YAxis />
        <HeatmapSeries data={heatmapData} colorRange={['red', 'blue']} />
      </XYPlot>
    </div>
  );
};

const PlaybackComparison: FC = () => {
  const [playbackBuffer, setPlaybackBuffer] = useState<Array<number>>([]);
  const [recordingSample, setRecordingSample] = useState<null | Array<number>>(null);
  const [playbackSample, setPlaybackSample] = useState<null | Array<number>>(null);

  const doPlay = useCallback((input: AudioNode) => {
    const context = createAudioContext();
    const takeInput = createTakeSampleNode(context, data => (setRecordingSample(data.slice(0, takeSize))));
    const [playbackData, takeAllInput] = createTakeAllNode(context);

    input.connect(takeInput);
    takeInput.connect(takeAllInput);
    takeAllInput.connect(context.destination);

    window.setTimeout(() => {
      input.disconnect(takeInput);
      takeInput.disconnect(takeAllInput);
      takeAllInput.disconnect(context.destination);
      setPlaybackBuffer(playbackData);
    }, 1000);
  }, [setPlaybackBuffer, setRecordingSample]);

  const playD = useCallback(() => {
    doPlay(createFrequenciesNode(createAudioContext(), waves.sin, [294], .5));
  }, [doPlay]);
  const playA = useCallback(() => {
    doPlay(createFrequenciesNode(createAudioContext(), waves.sin, [440], .5));
  }, [doPlay]);
  const playDA = useCallback(() => {
    doPlay(createFrequenciesNode(createAudioContext(), waves.sin, [294, 440], .5));
  }, [doPlay]);
  const playBestagons = useCallback(() => {
    doPlay(createBestagonStream());
  }, [doPlay]);
  const playMic = useCallback(async () => {
    const input = await createMicStream();
    doPlay(input);
  }, [doPlay]);

  const onPlayback = useCallback(() => {
    const context = createAudioContext();
    const takeInput = createTakeSampleNode(context, (data) => setPlaybackSample(data.slice(0, takeSize)));
    const input = createPlayArrayNode(context, playbackBuffer, () => {
      input.disconnect(takeInput);
      takeInput.disconnect(context.destination);
    });

    input.connect(takeInput);
    takeInput.connect(context.destination);
  }, [playbackBuffer, setPlaybackSample]);

  return (
    <>
      <h3>Record buttons:</h3>
      <div>
        <button onClick={playD}>D294</button>
        <button onClick={playA}>A440</button>
        <button onClick={playDA}>D294 + A440</button>
        <button onClick={playBestagons}>Bestagons</button>
        <button onClick={playMic}>Mic</button>
      </div>
      <Series height={100} width={750} data={recordingSample ?? []} />
      <h3>Playback:</h3>
      <button onClick={onPlayback}>Play</button>
      <Series height={100} width={750} data={playbackSample ?? []} />
      <h3>Frequencies:</h3>
      <Waterfall data={playbackBuffer} />
    </>
  );
};

export default PlaybackComparison;
