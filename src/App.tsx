import React, { FC } from 'react';

import PlayButtons from './PlayButtons';
import WaveChart from './WaveChart';

const App: FC = () => {

  return (
    <div>
      <PlayButtons />
      <br />
      <WaveChart />
    </div>
  );
}

export default App;
