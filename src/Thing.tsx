import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { createAudioContext, createBestagonStream, createCopyBufferNode, createPlayBufferNode, qri, trim } from './audio';

const Thing: FC = () => {
  const [audioContext, setAudioContext] = useState<null | AudioContext>(null);
  const [bestagonBuffer, setBestagonBuffer] = useState<null | AudioBuffer>(null);

  const doTheThing = useCallback(async () => {
    const context = await createAudioContext();
    const bestagonStream = await createBestagonStream();
    const bestagonStash: Array<number> = [];
    const takeAllInput = createCopyBufferNode(context, 'all',
      ({ buffer, channelIndex, inputIndex }) => {
        if (inputIndex === 0 && channelIndex === 0) {
          bestagonStash.push(...buffer);
        }
      },
    );

    bestagonStream.connect(takeAllInput);
    takeAllInput.connect(context.destination);

    bestagonStream.mediaElement.play();
    bestagonStream.mediaElement.onended = () => {
      bestagonStream.disconnect(takeAllInput);
      takeAllInput.disconnect(context.destination);

      const audioBuffer = context.createBuffer(1, bestagonStash.length, context.sampleRate);
      audioBuffer.copyToChannel(Float32Array.from(bestagonStash), 0);
      setBestagonBuffer(audioBuffer);
    };
    setAudioContext(context);
  }, []);

  const qriBestagonBuffer = useMemo(() => {
    if (!bestagonBuffer || !audioContext) { return null; }

    const bestagonData = Array.from(bestagonBuffer.getChannelData(0));
    const qriData = qri(bestagonData, 42, 23);

    const qriBuffer = audioContext.createBuffer(1, qriData.length, audioContext.sampleRate);
    qriBuffer.copyToChannel(Float32Array.from(qriData), 0);
    return qriBuffer;
  }, [audioContext, bestagonBuffer]);

  const [srcUrl, setSrcUrl] = useState<null | string>(null);

  useEffect(() => {
    if (!audioContext || !qriBestagonBuffer) { return; }

    const dest = audioContext.createMediaStreamDestination();
    const recorder = new MediaRecorder(dest.stream)
    const chunks: Array<Blob> = []
    recorder.ondataavailable = (event) => { chunks.push(event.data) };
    recorder.onstop = () => {
      const blob = new Blob(chunks, {type: 'audio/ogg; codecs=opus'});
      setSrcUrl(window.URL.createObjectURL(blob));
    };

    recorder.start();
    const replayNode = createPlayBufferNode(audioContext, Array.from(qriBestagonBuffer.getChannelData(0)), () => {
      recorder.stop();
    });
    replayNode.connect(dest);
  }, [audioContext, qriBestagonBuffer]);

  return (
    <div>
      <button onClick={doTheThing}>Do!The!Thing!</button>
      <ul>
        <li>bestagonBuffer: {String(bestagonBuffer !== null)}</li>
        <li>qriBestagonBuffer: {String(qriBestagonBuffer !== null)}</li>
        {(srcUrl !== null) && (
          <li><audio id="madness" controls src={srcUrl} ref={(element) => {
            if(element !== null){
              element.play();
            }
          }} /></li>
        )}
      </ul>
    </div>
  );
};

export default Thing;
