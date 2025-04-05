import React from 'react';
import PinConnection from './PinConnection';

const Joystick = ({ componentId, pins, onStartWire, onEndWire }) => {
  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h3>Joystick</h3>
      <PinConnection
        componentId={componentId}
        pins={pins}
        onStartWire={onStartWire}
        onEndWire={onEndWire}
      />
    </div>
  );
};

export default Joystick;