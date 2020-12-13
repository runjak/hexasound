import React, { FC } from 'react';
import { HorizontalGridLines, LineSeriesCanvas, LineSeriesPoint, VerticalGridLines, XYPlot, YAxis } from 'react-vis';
import 'react-vis/dist/style.css';

type Props = {
  width: number;
  height: number;
  data: Array<Array<LineSeriesPoint>>;
  onClick?: () => unknown;
};

const MultiSeries: FC<Props> = ({ width, height, data, onClick }) => {
  return (
    <div onClick={onClick}>
      <XYPlot width={width} height={height}>
        <HorizontalGridLines />
        <VerticalGridLines />
        <YAxis />
        {data.forEach((points, i) => (
          <LineSeriesCanvas key={`series-${i}`} data={points} />
        ))}
      </XYPlot>
    </div>
  );
};

export default MultiSeries;
