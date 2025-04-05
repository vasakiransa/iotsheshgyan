import React from 'react';

const PinConnection = ({ componentId, pins, onStartWire, onEndWire }) => {
  const handleMouseDown = (pin, event) => {
    // Only allow starting the wire if the pin is not connected
    if (!pin.connected) {
      onStartWire(componentId, pin.name, event); // Start wire dragging
    }
  };

  const handleMouseUp = (pin, event) => {
    // Only allow ending the wire if the pin is not connected
    if (!pin.connected) {
      onEndWire(componentId, pin.name, event); // End wire dragging and connect
    }
  };

  return (
    <div className="pins" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
      {pins.map((pin) => (
        <div key={pin.name} className="pin" style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onMouseDown={(e) => handleMouseDown(pin, e)} // Start wire on mouse down
            onMouseUp={(e) => handleMouseUp(pin, e)}     // End wire on mouse up
            style={{
              padding: '5px 10px',
              backgroundColor: pin.connected ? 'green' : '#1976d2', // Green if connected
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: pin.connected ? 'not-allowed' : 'pointer',  // Disable cursor if pin connected
            }}
            disabled={pin.connected} // Disable the button if pin is connected
          >
            {pin.name} {/* Render pin name */}
          </button>
        </div>
      ))}
    </div>
  );
};

export default PinConnection;
