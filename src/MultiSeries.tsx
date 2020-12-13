import React, { FC, memo } from 'react';
import { HorizontalGridLines, LineSeriesCanvas, LineSeriesPoint, VerticalGridLines, XAxis, XYPlot, YAxis } from 'react-vis';
import 'react-vis/dist/style.css';

export type MultiSeriesData = Array<Array<LineSeriesPoint>>;

type Props = {
  width: number;
  height: number;
  data: MultiSeriesData;
  onClick?: () => unknown;
};

const MultiSeries: FC<Props> = memo(({ width, height, data, onClick }) => {
  return (
    <div onClick={onClick}>
      <XYPlot width={width} height={height}>
        <HorizontalGridLines />
        <VerticalGridLines />
        <XAxis />
        <YAxis />
        {data.map((points, i) => (
          <LineSeriesCanvas key={`series-${i}`} data={points} />
        ))}
      </XYPlot>
    </div>
  );
});

export default MultiSeries;
