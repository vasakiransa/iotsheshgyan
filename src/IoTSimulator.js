import React, { useEffect } from "react";
import { io } from "socket.io-client";
import "@wokwi/elements"; // Import Wokwi Web Component

const socket = io("http://localhost:5000");

const IoTSimulator = () => {
  useEffect(() => {
    socket.on("updateUI", (data) => {
      console.log("Updated Data from Server:", data);
    });

    return () => socket.off("updateUI");
  }, []);

  const sendSensorData = () => {
    socket.emit("sensorData", { temperature: Math.random() * 100 });
  };

  return (
    <div>
      <h1>IoT Simulator with Wokwi</h1>
      {/* Wokwi ESP32 Simulator */}
      <wokwi-esp32 style={{ width: "800px", height: "600px" }}></wokwi-esp32>
      
      <button onClick={sendSensorData}>Send Sensor Data</button>
    </div>
  );
};

export default IoTSimulator;
