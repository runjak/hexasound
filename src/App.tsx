import React, { useCallback } from 'react';

import { createSinusNode, createContext } from './audio';

const App = () => {
  const onClick = useCallback(() => {
    const audioContext = createContext();
    const a = createSinusNode(audioContext, 440, 0.1);

    a.connect(audioContext.destination);

    window.setTimeout(() => { a.disconnect(audioContext.destination) }, 1000);
  }, []);

  return (
    <div>
      <button onClick={onClick}>
        Zebra!
      </button>
    </div>
  );
}

export default App;
