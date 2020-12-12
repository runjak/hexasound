import React, { FC, useEffect, useState } from 'react';

const yMargin = 1;

type Props = {
  width: number;
  height: number;
  data: Array<number>;
  onClick?: () => unknown;
};

const Series: FC<Props> = ({ width, height, data, onClick }) => {
  const [canvas, setCanvas] = useState<null | HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvas) { return; }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) { return; }

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(200, 200, 200)';

    const unit = Math.round(height / 2) - (2 * yMargin + 1);
    const sliceWidth = width / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      let y = data[i] * unit + unit + (2 * yMargin);

      if (i === 0) {
        ctx.moveTo(0, y);
        ctx.beginPath();
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, unit);
    ctx.stroke();

  }, [canvas, width, height, data]);

  return (
    <canvas ref={setCanvas} style={{ width, height }} onClick={onClick} />
  );
};

export default Series;
