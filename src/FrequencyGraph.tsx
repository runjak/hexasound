import React, { FC, useEffect, useState } from 'react';

type Props = { analyser: AnalyserNode };

const width = 800;
const height = 100;

const FrequencyGraph: FC<Props> = ({ analyser }) => {
  const [canvas, setCanvas] = useState<null | HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvas === null) { return; }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const canvasCtx = canvas.getContext('2d');
    if (canvasCtx === null) { return; }

    let shouldRender = true;
    const draw = () => {
      if (shouldRender) {
        requestAnimationFrame(draw);
      }

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      analyser.getFloatFrequencyData(dataArray);

      const barWidth = (canvas.width / dataArray.length) * 0.5;
      let posX = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] + 140) * 2;
        canvasCtx.fillStyle = 'rgb(' + Math.floor(barHeight + 100) + ', 50, 50)';
        canvasCtx.fillRect(posX, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        posX += barWidth + 1;
      }
    };
    draw();

    return () => { shouldRender = false; }
  }, [canvas, analyser]);

  return (
    <canvas ref={setCanvas} style={{ width: `${width}px`, height: `${height}px` }} />
  );
};

export default FrequencyGraph;
