import React, { useCallback } from 'react';

import { createSinusNode, context as audioContext } from './audio';

const App = () => {
  const onClick = useCallback(() => {
    const a = createSinusNode(audioContext, 440);

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
