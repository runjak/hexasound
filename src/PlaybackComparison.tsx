import React, { FC, useCallback, useMemo, useState } from 'react';

import {
  bufferWindows,
  createAudioContext,
  createBestagonStream,
  createCopyBufferNode,
  createMicStream,
  createPlayBufferNode,
  createSimpleWaveNode,
  fft,
  FFTOutput,
} from './audio';
import Series from './Series';
import { HeatmapSeries, XAxis, XYPlot, YAxis } from 'react-vis';

const takeSize = 1000;

type HeatmapPoint = { x: number, y: number, color: number };
type HeatmapData = Array<HeatmapPoint>;

const toHeatmapData = (protoData: Array<FFTOutput>): HeatmapData => {
  return protoData.flatMap((row: FFTOutput, y: number): HeatmapData => (
    Array.from(row.real).slice(0, 500).map((color, x) => ({ x, y, color: Math.abs(color) })))
  );
};

const Waterfall: FC<{ data: Array<number> }> = ({ data }) => {
  const protoData = useMemo(() => {
    const protoData: Array<FFTOutput> = [];
    Array.from(bufferWindows(data)).forEach((w) => {
      protoData.push(fft(w));
    });
    return protoData;
  }, [data]);
  const heatmapData = useMemo(() => {
    return toHeatmapData(protoData);
  }, [protoData])

  const onClick = useCallback(async () => {
    const context = await createAudioContext();
    const { imag, real } = protoData[0];
    const wave = context.createPeriodicWave(real, imag, { disableNormalization: false });

    const oscillator = context.createOscillator();
    oscillator.setPeriodicWave(wave);
    oscillator.connect(context.destination);
    oscillator.start();

    window.setTimeout(() => {
      oscillator.stop();
      oscillator.disconnect(context.destination);
    }, 1000);
  }, [protoData]);

  return (
    <div>
      <XYPlot width={750} height={750} onClick={onClick}>
        <XAxis />
        <YAxis />
        <HeatmapSeries data={heatmapData} colorRange={['red', 'blue']} />
      </XYPlot>
    </div>
  );
};

const PlaybackComparison: FC = () => {
  const [playbackBuffer, setPlaybackBuffer] = useState<Array<number>>([]);
  const [recordingSample, setRecordingSample] = useState<Array<number>>([]);
  const [playbackSample, setPlaybackSample] = useState<Array<number>>([]);

  const doPlay = useCallback(async (input: AudioNode) => {
    const context = await createAudioContext();
    const takeInput = createCopyBufferNode(context, 'first', ({ buffer }) => setRecordingSample(buffer.slice(0, takeSize)));
    let playbackData: Array<number> = [];
    const takeAllInput = createCopyBufferNode(context, 'all',
      ({ buffer, channelIndex, inputIndex }) => {
        if (inputIndex === 0 && channelIndex === 0) {
          playbackData.push(...buffer);
        }
      },
    );

    input.connect(takeInput);
    takeInput.connect(takeAllInput);
    takeAllInput.connect(context.destination);

    window.setTimeout(() => {
      input.disconnect(takeInput);
      takeInput.disconnect(takeAllInput);
      takeAllInput.disconnect(context.destination);
      setPlaybackBuffer(playbackData.slice());
    }, 1000);
  }, [setPlaybackBuffer, setRecordingSample]);

  const playD = useCallback(async () => {
    const context = await createAudioContext();
    doPlay(createSimpleWaveNode(context, 'sin', [294], .5));
  }, [doPlay]);
  const playA = useCallback(async () => {
    const context = await createAudioContext();
    doPlay(createSimpleWaveNode(context, 'sin', [440], .5));
  }, [doPlay]);
  const playDA = useCallback(async () => {
    const context = await createAudioContext();
    doPlay(createSimpleWaveNode(context, 'sin', [294, 440], .5));
  }, [doPlay]);
  const playBestagons = useCallback(async () => {
    const bestagonStream = await createBestagonStream();
    doPlay(bestagonStream);
  }, [doPlay]);
  const playMic = useCallback(async () => {
    const input = await createMicStream();
    doPlay(input);
  }, [doPlay]);

  const onPlayback = useCallback(async () => {
    const context = await createAudioContext();
    const takeInput = createCopyBufferNode(context, 'first', ({ buffer }) => setPlaybackSample(buffer.slice(0, takeSize)));
    const input = createPlayBufferNode(context, playbackBuffer, () => {
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
      <Series height={100} width={750} data={recordingSample} />
      <h3>Playback:</h3>
      <button onClick={onPlayback}>Play</button>
      <Series height={100} width={750} data={playbackSample} />
      <h3>Frequencies:</h3>
      <Waterfall data={playbackBuffer} />
    </>
  );
};

export default PlaybackComparison;
