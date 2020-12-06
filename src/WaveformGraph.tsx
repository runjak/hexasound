import React, { FC, useEffect, useState } from 'react';

type Props = { analyser: AnalyserNode };

const width = 800;
const height = 100;

const WaveformGraph: FC<Props> = ({ analyser }) => {
  const [canvas, setCanvas] = useState<null | HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas === null) { return; }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvasCtx = canvas.getContext('2d');
    if (canvasCtx === null) { return; }

    let shouldRender = true;
    const draw = () => {
      if (shouldRender) {
        requestAnimationFrame(draw);
      }

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(200, 200, 200)';
      canvasCtx.beginPath();

      analyser.getByteTimeDomainData(dataArray);

      let sliceWidth = canvas.width * 0.1 / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 128.0;
        let y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };
    draw();

    return () => { shouldRender = false; }
  }, [canvas, analyser]);

  return (
    <canvas ref={setCanvas} style={{ width: `${width}px`, height: `${height}px` }} />
  );
};

export default WaveformGraph;
