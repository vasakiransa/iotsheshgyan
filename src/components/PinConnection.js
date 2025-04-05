// PinConnection.js
import React from 'react';

const PinConnection = ({ componentId, pins, onStartWire }) => {
    // Determine the pin color based on its name (left or right)
    const getPinColor = (pinName) => {
        if (pinName.startsWith('left')) {
            return '#1976d2'; // Blue for left pins
        } else if (pinName.startsWith('right')) {
            return '#d32f2f'; // Red for right pins
        }
        return '#1976d2'; // Default color
    };

    return (
        <div className="pins" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {pins.map((pin) => (
                <div
                    key={pin.name}
                    className="pin"
                    style={{
                        position: 'relative',  // Ensure the pin dot is positioned relative to the pin container
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: getPinColor(pin.name),  // Use dynamic color
                            cursor: 'pointer', // Always a pointer, interaction always allowed
                            pointerEvents: 'auto', // Always enable click events to start a new connection
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();  // Prevent dragging the component
                            onStartWire(componentId, pin.name, e);  // Pass only pin name
                        }}
                    />
                    {pin.name}
                </div>
            ))}
        </div>
    );
};

export default PinConnection;
