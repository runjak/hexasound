import React, { FC, useMemo } from 'react';
import { HorizontalGridLines, LineSeriesCanvas, VerticalGridLines, XYPlot, YAxis } from 'react-vis';

import 'react-vis/dist/style.css';

type Props = {
  width: number;
  height: number;
  data: Array<number>;
  onClick?: () => unknown;
};

const Series: FC<Props> = ({ width, height, data, onClick }) => {
  const dataPoints = useMemo(() => data.map((y, x) => ({ x, y })), [data]);

  return (
    <div onClick={onClick}>
      <XYPlot width={width} height={height}>
        <HorizontalGridLines />
        <VerticalGridLines />
        <YAxis />
        <LineSeriesCanvas
          className="first-series"
          data={dataPoints}
        />
      </XYPlot>
    </div>
  );
};

export default Series;
