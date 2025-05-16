
import React, { useEffect, useRef, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import * as Blockly from "blockly";
import { javascriptGenerator } from "blockly/javascript";
import "blockly/blocks";
import {
  Container,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MinimizeIcon from "@mui/icons-material/Minimize";
import MaximizeIcon from "@mui/icons-material/Maximize";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DraggableComponent from "./components/DraggableComponent";
import Workspace from "./components/Workspace";
import bridgeImage from "./assets/bridge.svg";
import ldrImage from "./assets/ldr.svg";
import objectImage from "./assets/object.svg";
import audioplayerImage from "./assets/audioplayer.svg";
import oledImage from "./assets/oled.svg";
import sensorImage from "./assets/sensor.png";
import ledImage from "./assets/led.png";
import motorImage from "./assets/motor.png";
import buzzerImage from "./assets/buzzer.png";
import joystickImage from "./assets/joystick.png";
import smartLightImage from "./assets/smartlightled.png";
import sevenSegmentImage from "./assets/sevensegmentdisplay.png";
import panTiltImage from "./assets/panandtilt.png";
import "./App.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0288d1" },
    secondary: { main: "#d81b60" },
    background: { default: "#e3f2fd" },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: "none",
          padding: "12px 24px",
          boxShadow: "0 4px 14px rgba(2, 136, 209, 0.3)",
          "&:hover": { boxShadow: "0 6px 20px rgba(2, 136, 209, 0.5)" },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "40px",
          backgroundColor: "#e3f2fd",
          borderRadius: "8px 8px 0 0",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: "40px",
          textTransform: "none",
          fontWeight: 500,
          color: "#0288d1",
          "&.Mui-selected": {
            color: "#fff",
            backgroundColor: "#0288d1",
            borderRadius: "8px 8px 0 0",
          },
        },
      },
    },
  },
});

const IoTSimulator = () => {
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [outputLog, setOutputLog] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("iotSimulatorSessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [openSessionsDialog, setOpenSessionsDialog] = useState(false);
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const audioContextRef = useRef(null);

  const esp32Pins = [
    "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12"
  ];
  const rgbLedPins = ["C011", "C012", "C013"];
  const sensorPins = ["C08", "VCC", "GND"];
  const joystickPins = ["VRX", "VRY", "SW"];

  const pinDeviceMap = {
    "C01": { device: "BUZZER", description: "The buzzer will turn on with sound." },
    "C03": { device: "SEVENSEGMENT", description: "It is showing the number." },
    "C02": { device: "SOIL_SENSOR", description: "It is reading soil data." },
    "C04": { device: "DIP_SWITCH", description: "It is toggled." },
    "C09": { device: "PAN_AND_TILT", description: "The servo will rotate." },
    "C06": { device: "WEATHER_MONITORING", description: "It senses temperature and humidity." },
    "C06": { device: "DC_MOTOR", description: "The motor will spin." },
    "C12": { device: "ULTRASONIC_SENSOR", description: "It senses the obstacle." },
    "C01": { device: "OLED", description: "It is showing the picture and number." },
    "C10": { device: "JOYSTICK", description: "It is showing the X-axis and Y-axis values." },
    "C011": { device: "TRI_COLOUR_LED", description: "The LED will glow." },
    
    "C12": { device: "OBJECT", description: "The object is detected." },
  };

  const componentsList = [
    { id: 1, name: "IoT Bridge", type: "bridge", image: bridgeImage, category: "Bridge", defaultPin: "C01" },
    { id: 2, name: "RGB LED", type: "led", image: ledImage, category: "LED", defaultPin: "C011" },
    { id: 3, name: "Ultrasonic Sensor", type: "sensor", image: sensorImage, category: "Sensor", defaultPin: "C12" },
    { id: 4, name: "DC Motor", type: "motor", image: motorImage, category: "Motor", defaultPin: "C06" },
    { id: 5, name: "Buzzer", type: "buzzer", image: buzzerImage, category: "Sound", defaultPin: "C01" },
    { id: 6, name: "Joystick", type: "joystick", image: joystickImage, category: "Joystick", defaultPin: "C10" },
    { id: 8, name: "7-Segment", type: "sevensegment", image: sevenSegmentImage, category: "Display", defaultPin: "C03" },
    { id: 9, name: "Pan & Tilt", type: "pantilt", image: panTiltImage, category: "Motor", defaultPin: "C09" },
    { id: 11, name: "OLED", type: "oled", image: oledImage, category: "Display", defaultPin: "C01" },
    { id: 13, name: "Object", type: "object", image: objectImage, category: "Other", defaultPin: "C06" },
  ];

  const categories = {
    Bridge: ["bridge"],
    LED: ["led"],
    Display: ["sevensegment", "oled"],
    Sensor: ["sensor"],
    Sound: ["buzzer"],
    Motor: ["motor", "pantilt"],
    Joystick: ["joystick"],
    Other: [ "object"],
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const normalizePin = (pin) => {
    if (!pin) return pin;
    return pin.replace(/^C(\d{1,2})$/, (match, num) => `C${num.padStart(3, "0")}`);
  };

  const updateComponentState = (componentId, updates) => {
    console.log(`Updating component ${componentId} with:`, updates);
    setComponents((prev) => {
      const newComponents = prev.map((comp) =>
        comp.id === componentId ? { ...comp, ...updates } : comp
      );
      console.log("New components state:", newComponents);
      return newComponents;
    });
    
  };

  const findComponentByBridgePin = (bridgePin, componentType) => {
    console.log(`Searching for ${componentType} connected to bridge pin ${bridgePin}`);
    console.log("Current components:", components);
    console.log("Current wires:", wires);

    if (!bridgePin) {
      console.warn("No bridge pin provided");
      return null;
    }

    const normalizedBridgePin = normalizePin(bridgePin);
    console.log(`Normalized bridge pin: ${normalizedBridgePin}`);

    const bridge = components.find((comp) => comp.type === "bridge");
    if (!bridge) {
      console.warn("No bridge component found");
      return null;
    }

    // Check for wire connecting bridge to component
    const wire = wires.find((w) => {
      const sourcePin = normalizePin(w.sourcePin);
      const targetPin = normalizePin(w.targetPin);
      return (
        (w.sourceId === bridge.id && sourcePin === normalizedBridgePin) ||
        (w.targetId === bridge.id && targetPin === normalizedBridgePin)
      );
    });

    if (wire) {
      console.log(`Found wire:`, wire);
      const componentId = wire.sourceId === bridge.id ? wire.targetId : wire.sourceId;
      const component = components.find(
        (comp) => comp.id === componentId && comp.type === componentType
      );
      if (component) {
        console.log(`Found ${componentType} (ID: ${component.id}) via wire for pin ${bridgePin}`);
        return component;
      } else {
        console.warn(`No ${componentType} found for component ID ${componentId}`);
      }
    } else {
      console.warn(`No wire found for pin ${normalizedBridgePin}`);
    }

    // Check connectedPins
    const componentByConnectedPins = components.find(
      (comp) =>
        comp.type === componentType &&
        comp.connectedPins?.some((pin) => normalizePin(pin) === normalizedBridgePin)
    );
    if (componentByConnectedPins) {
      console.log(`Found ${componentType} (ID: ${componentByConnectedPins.id}) via connectedPins for pin ${bridgePin}`);
      return componentByConnectedPins;
    }

    // Fallback to comp.pin
    const componentByPin = components.find(
      (comp) => comp.type === componentType && normalizePin(comp.pin) === normalizedBridgePin
    );
    if (componentByPin) {
      console.log(`Found ${componentType} (ID: ${componentByPin.id}) via comp.pin for pin ${bridgePin}`);
      return componentByPin;
    }

    console.warn(`No ${componentType} found for pin ${bridgePin}`);
    return null;
  };

  const activateBUZZER = (pin) => {
    console.log(`Activating BUZZER on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "buzzer");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const playBuzzerFrequency = async (freq, duration, pin) => {
    console.log(`Playing BUZZER ${freq}Hz for ${duration}s on pin ${pin}`);
    setOutputLog((prev) => [
      ...prev,
      `Buzzer on pin ${pin}: Playing ${freq}Hz for ${duration}s`,
    ]);

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        setOutputLog((prev) => [...prev, "AudioContext initialized"]);
      }

      const audioCtx = audioContextRef.current;
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
        setOutputLog((prev) => [...prev, "AudioContext resumed"]);
      }

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(parseFloat(freq), audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

      oscillator.start();
      setOutputLog((prev) => [...prev, `Buzzer started at ${freq}Hz`]);

      await new Promise((resolve) => setTimeout(resolve, parseFloat(duration) * 1000));
      oscillator.stop();
      setOutputLog((prev) => [...prev, `Buzzer stopped after ${duration}s`]);

      const component = findComponentByBridgePin(pin, "buzzer");
      if (component) {
        updateComponentState(component.id, {
          state: "played",
          freq: parseInt(freq),
          duration: parseFloat(duration),
          pin,
        });
      }
    } catch (error) {
      setOutputLog((prev) => [...prev, `Audio Error: ${error.message}`]);
    }
    checkConnection();
  };

  const activateSEVENSEGMENT = (pin) => {
    console.log(`Activating SEVENSEGMENT on pin ${pin}`);
    setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "sevensegment");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const displaySevenSegment = (number, pin) => {
    console.log(`Calling displaySevenSegment(${number}, "${pin}")`);
    const num = Math.floor(Number(number)) % 10;
    setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: Displaying ${num}`]);
    const component = findComponentByBridgePin(pin, "sevensegment");
    if (component) {
      updateComponentState(component.id, {
        state: "displaying",
        value: num,
        pin,
      });
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No 7-Segment display found for pin ${pin}`,
      ]);
    }
    checkConnection();
  };

  const activateSOIL_SENSOR = (pin) => {
    console.log(`Activating SOIL_SENSOR on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Soil Sensor on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "sensor");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const activateDIP_SWITCH = (pin) => {
    console.log(`Activating DIP_SWITCH on pin ${pin}`);
    setOutputLog((prev) => [...prev, `DIP Switch on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "switch");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const activatePAN_AND_TILT = (pin) => {
    console.log(`Activating PAN_AND_TILT on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Pan & Tilt on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "pantilt");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const controlPanTilt = (pan, tilt, pin) => {
    console.log(`Calling controlPanTilt(${pan}, ${tilt}, "${pin}")`);
    const panAngle = Math.max(0, Math.min(180, Number(pan)));
    const tiltAngle = Math.max(0, Math.min(180, Number(tilt)));
    setOutputLog((prev) => [
      ...prev,
      `Pan & Tilt on pin ${pin}: Pan=${panAngle}°, Tilt=${tiltAngle}°`,
    ]);
    const component = findComponentByBridgePin(pin, "pantilt");
    if (component) {
      updateComponentState(component.id, {
        state: "moving",
        angle: { pan: panAngle, tilt: tiltAngle },
        pin,
      });
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No Pan & Tilt found for pin ${pin}`,
      ]);
    }
    checkConnection();
  };

  const activateDC_MOTOR = (pin) => {
    console.log(`Activating DC_MOTOR on pin ${pin}`);
    setOutputLog((prev) => [...prev, `DC Motor on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "motor");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const controlMotor = (speed, direction, pin) => {
    console.log(`Calling controlMotor(${speed}, "${direction}", "${pin}")`);
    const motorSpeed = Math.max(0, Math.min(255, Number(speed)));
    const validDirection = direction.toUpperCase() === "BACKWARD" ? "backward" : "forward";
    setOutputLog((prev) => [
      ...prev,
      `DC Motor on pin ${pin}: Speed=${motorSpeed}, Direction=${validDirection}`,
    ]);
    const component = findComponentByBridgePin(pin, "motor");
    if (component) {
      updateComponentState(component.id, {
        state: motorSpeed > 0 ? "spinning" : "stopped",
        speed: motorSpeed,
        direction: validDirection,
        pin,
      });
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No DC Motor found for pin ${pin}`,
      ]);
    }
    checkConnection();
  };

  const activateWEATHER_MONITORING = (pin) => {
    console.log(`Activating WEATHER_MONITORING on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Weather Monitoring on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "sensor");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const activateTRI_COLOUR_LED = (pin) => {
    console.log(`Activating TRI_COLOUR_LED on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "led");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const activateULTRASONIC_SENSOR = (pin) => {
    console.log(`Activating ULTRASONIC_SENSOR on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Ultrasonic Sensor on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "sensor");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    window.measureDistanceWrapper();
    checkConnection();
  };

  const activateOLED = (pin) => {
    console.log(`Activating OLED on pin ${pin}`);
    setOutputLog((prev) => [...prev, `OLED on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "oled");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const displayOLED = (text, pin) => {
    console.log(`Calling displayOLED(${text}, "${pin}")`);
    const displayText = String(text).replace(/^"|"$/g, "");
    setOutputLog((prev) => [...prev, `OLED on pin ${pin}: Displaying ${displayText}`]);
    const component = findComponentByBridgePin(pin, "oled");
    if (component) {
      updateComponentState(component.id, {
        state: "displaying",
        displayText,
        pin,
      });
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No OLED found for pin ${pin}`,
      ]);
    }
    checkConnection();
  };

  const activateJOYSTICK = (pin) => {
    console.log(`Activating JOYSTICK on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Joystick on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "joystick");
    if (component) {
      const { xValue, yValue } = readJoystick();
      updateComponentState(component.id, {
        state: "active",
        xValue,
        yValue,
        pin,
      });
      setOutputLog((prev) => [
        ...prev,
        `Joystick on pin ${pin}: X=${xValue}, Y=${yValue}`,
      ]);
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No Joystick found for pin ${pin}`,
      ]);
    }
    checkConnection();
  };

  const readJoystick = () => {
    const xValue = Math.floor(Math.random() * 1024);
    const yValue = Math.floor(Math.random() * 1024);
    return { xValue, yValue };
  };

  const activateSMARTLIGHT = (pin) => {
    console.log(`Activating SMARTLIGHT on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Smart Light on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "smartlight");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const smartLightVibgyor = (pin) => {
    console.log(`Calling smartLightVibgyor("${pin}")`);
    setOutputLog((prev) => [...prev, `Smart Light on pin ${pin}: Displaying VIBGYOR`]);
    const component = findComponentByBridgePin(pin, "smartlight");
    if (component) {
      updateComponentState(component.id, { state: "vibgyor", pin });
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No Smart Light found for pin ${pin}`,
      ]);
    }
    checkConnection();
  };

  const setLedRGB = (r, g, b, pin) => {
    console.log(`Calling setLedRGB(${r}, ${g}, ${b}, "${pin}")`);
    const red = Math.max(0, Math.min(255, Number(r)));
    const green = Math.max(0, Math.min(255, Number(g)));
    const blue = Math.max(0, Math.min(255, Number(b)));
    setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: RGB(${red}, ${green}, ${blue})`]);
    const component = findComponentByBridgePin(pin, "led");
    if (component) {
      updateComponentState(component.id, {
        state: "glowing",
        r: red,
        g: green,
        b: blue,
        pin,
      });
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No RGB LED found for pin ${pin}`,
      ]);
    }
    checkConnection();
  };
  const activateOBJECT = (pin) => {
    console.log(`Activating OBJECT on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Object on pin ${pin}: Detected`]);
    const component = findComponentByBridgePin(pin, "object");
    if (component) {
      updateComponentState(component.id, { state: "detected", pin });
    }
    window.measureDistanceWrapper();
    checkConnection();
  };
 const measureDistance = (components, setOutputLog) => {
  const sensor = components.find((comp) => comp.type === "sensor");
  const object = components.find((comp) => comp.type === "object");

  if (sensor && object) {
    // Check if object is directly on top of the sensor
    const isObjectOnTop =
      object.x === sensor.x && object.y < sensor.y;

    if (isObjectOnTop) {
      const distance = Math.sqrt(
        Math.pow(sensor.x - object.x, 2) + Math.pow(sensor.y - object.y, 2)
      ).toFixed(2);

      setOutputLog((prev) => [
        ...prev,
        `Ultrasonic Sensor detected: Distance to Object is ${distance} pixels`,
      ]);
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Object not on top of the sensor`,
      ]);
    }
  } else {
    setOutputLog((prev) => [
      ...prev,
      `Measurement failed: ${!sensor ? "Sensor missing" : ""} ${
        !object ? "Object missing" : ""
      }`,
    ]);
  }
};

  


  const handleAddComponent = (id, name, type, image, defaultPin) => {
    setComponents((prev) => [
      ...prev,
      {
        id: `${id}-${Date.now()}`,
        name,
        type,
        image,
        x: 100,
        y: 100,
        pin: defaultPin,
        connectedPins: [],
        state: null,
        value: type === "sevensegment" ? 0 : null,
        angle: type === "pantilt" ? { pan: 0, tilt: 0 } : null,
        speed: type === "motor" ? 0 : null,
        direction: type === "motor" ? "forward" : null,
        displayText: type === "oled" ? "" : null,
        xValue: type === "joystick" ? 0 : null,
        yValue: type === "joystick" ? 0 : null,
        r: type === "led" ? 0 : null,
        g: type === "led" ? 0 : null,
        b: type === "led" ? 0 : null,
      },
    ]);
  };

  const addWire = (sourceId, targetId, sourcePin, targetPin) => {
    setWires((prev) => {
      const newWire = {
        id: `${sourceId}-${targetId}-${Date.now()}`,
        sourceId,
        sourcePin,
        targetId,
        targetPin,
      };
      console.log("Adding wire:", newWire);

      // Update connectedPins for the target component
      setComponents((prevComps) => {
        const sourceIsBridge = prevComps.find((comp) => comp.id === sourceId)?.type === "bridge";
        const targetIsBridge = prevComps.find((comp) => comp.id === targetId)?.type === "bridge";
        let bridgePin, componentId;

        if (sourceIsBridge) {
          bridgePin = sourcePin;
          componentId = targetId;
        } else if (targetIsBridge) {
          bridgePin = targetPin;
          componentId = sourceId;
        }

        if (bridgePin && componentId) {
          const normalizedBridgePin = normalizePin(bridgePin);
          return prevComps.map((comp) => {
            if (comp.id === componentId) {
              const updatedPins = comp.connectedPins
                ? [...new Set([...comp.connectedPins, normalizedBridgePin])]
                : [normalizedBridgePin];
              console.log(`Updating connectedPins for component ${comp.id} to:`, updatedPins);
              return { ...comp, connectedPins: updatedPins };
            }
            return comp;
          });
        }
        return prevComps;
      });

      return [...prev, newWire];
    });
  };

  const checkConnection = () => {
    console.log("Checking connections...");
    console.log("Components:", components);
    console.log("Wires:", wires);
    const bridge = components.find((comp) => comp.type === "bridge");
    if (!bridge) {
      console.warn("No bridge component found in checkConnection");
      return;
    }

    wires.forEach((wire) => {
      const sourceComp = components.find((comp) => comp.id === wire.sourceId);
      const targetComp = components.find((comp) => comp.id === wire.targetId);
      if (!sourceComp || !targetComp) return;

      let bridgePin, component;
      if (sourceComp.type === "bridge") {
        bridgePin = normalizePin(wire.sourcePin);
        component = targetComp;
      } else if (targetComp.type === "bridge") {
        bridgePin = normalizePin(wire.targetPin);
        component = sourceComp;
      }

      if (bridgePin && component && component.type !== "bridge") {
        const deviceInfo = pinDeviceMap[bridgePin];
        if (deviceInfo) {
          const logMessage = `IoT Bridge connected to ${component.name} on pin ${bridgePin}: ${deviceInfo.description}`;
          setOutputLog((prev) => {
            if (!prev.includes(logMessage)) return [...prev, logMessage];
            return prev;
          });
          updateComponentState(component.id, {
            state: deviceInfo.device === "TRI_COLOUR_LED" ? "glowing" : "active",
            connectedPins: component.connectedPins
              ? [...new Set([...component.connectedPins, bridgePin])]
              : [bridgePin],
          });
          console.log(`Confirmed connection: ${component.name} on pin ${bridgePin}`);
        }
      }
    });
  };

  const saveSession = () => {
    const workspaceXml = Blockly.Xml.domToText(
      Blockly.Xml.workspaceToDom(workspaceRef.current)
    );
    const sessionData = {
      id: Date.now(),
      name: `Session_${new Date().toLocaleString()}`,
      components: components.map((comp) => ({
        id: comp.id,
        name: comp.name,
        type: comp.type,
        image: comp.image,
        x: comp.x,
        y: comp.y,
        pin: comp.pin,
        connectedPins: comp.connectedPins,
        state: comp.state,
        value: comp.value,
        angle: comp.angle,
        speed: comp.speed,
        direction: comp.direction,
        displayText: comp.displayText,
        xValue: comp.xValue,
        yValue: comp.yValue,
        r: comp.r,
        g: comp.g,
        b: comp.b,
      })),
      wires: wires.map((wire) => ({
        id: wire.id,
        sourceId: wire.sourceId,
        targetId: wire.targetId,
        sourcePin: wire.sourcePin,
        targetPin: wire.targetPin,
      })),
      blocklyWorkspace: workspaceXml,
    };

    const updatedSessions = [...sessions, sessionData];
    setSessions(updatedSessions);
    localStorage.setItem("iotSimulatorSessions", JSON.stringify(updatedSessions));
    setSnackbarOpen(true);
  };

  const loadSession = (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    setComponents(
      session.components.map((comp) => ({
        id: comp.id,
        name: comp.name,
        type: comp.type,
        image: comp.image,
        x: comp.x,
        y: comp.y,
        pin: comp.pin,
        connectedPins: comp.connectedPins,
        state: comp.state,
        value: comp.value,
        angle: comp.angle,
        speed: comp.speed,
        direction: comp.direction,
        displayText: comp.displayText,
        xValue: comp.xValue,
        yValue: comp.yValue,
        r: comp.r,
        g: comp.g,
        b: comp.b,
      }))
    );

    setWires(
      session.wires.map((wire) => ({
        id: wire.id,
        sourceId: wire.sourceId,
        targetId: wire.targetId,
        sourcePin: wire.sourcePin,
        targetPin: wire.targetPin,
      }))
    );

    if (session.blocklyWorkspace && workspaceRef.current) {
      workspaceRef.current.clear();
      const xml = Blockly.Xml.textToDom(session.blocklyWorkspace);
      Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
    }

    setOutputLog([]);
    setGeneratedCode("");
    setOpenSessionsDialog(false);
    checkConnection();
  };

  useEffect(() => {
    if (!javascriptGenerator) {
      console.error("JavaScript generator not initialized!");
      return;
    }
    window.measureDistanceWrapper = () => measureDistance(components, setOutputLog);

    Blockly.Blocks["start"] = {
      init: function () {
        this.appendDummyInput().appendField("Start");
        this.setNextStatement(true);
        this.setColour(0);
      },
    };
    javascriptGenerator["start"] = function () {
      return "// Start of program\n";
    };

  let generatedOutput = ""; // Variable to store all generated outputs

componentsList.forEach((comp) => {
  Blockly.Blocks[comp.type] = {
    init: function () {
      this.appendDummyInput().appendField(comp.name);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(180);
    },
  };

  javascriptGenerator[comp.type] = function () {
    const pin = comp.defaultPin;
    let device = pinDeviceMap[normalizePin(pin)]?.device || comp.type.toUpperCase();

    // Explicitly map 'sensor' type to 'ULTRASONIC_SENSOR'
    if (comp.type === "sensor") {
      device = "ULTRASONIC_SENSOR";
    }

    const code = `activate${device}("${pin}");\n`;

    // Append to generated output
    generatedOutput += code;

    return code;
  };
});

// Function to trigger the alert and log the output
const showGeneratedOutput = () => {
  window.alert(generatedOutput);
  setOutputLog((prev) => [...prev, `Alert: ${generatedOutput}`]);
};

    Blockly.Blocks["sevensegment_display"] = {
      init: function () {
        this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Display on 7-Segment");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Displays a number (0-9) on the 7-segment display");
      },
    };
    javascriptGenerator["sevensegment_display"] = function (block) {
      const number =
        javascriptGenerator.valueToCode(
          block,
          "NUMBER",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C03";
      return `displaySevenSegment(${number}, "${pin}");\n`;
    };

    Blockly.Blocks["pantilt_control"] = {
      init: function () {
        this.appendValueInput("PAN")
          .setCheck("Number")
          .appendField("Pan & Tilt - Pan Angle:");
        this.appendValueInput("TILT")
          .setCheck("Number")
          .appendField("Tilt Angle:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Sets the pan and tilt angles (0-180 degrees)");
      },
    };
    javascriptGenerator["pantilt_control"] = function (block) {
      const pan =
        javascriptGenerator.valueToCode(
          block,
          "PAN",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const tilt =
        javascriptGenerator.valueToCode(
          block,
          "TILT",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C09";
      return `controlPanTilt(${pan}, ${tilt}, "${pin}");\n`;
    };

    Blockly.Blocks["motor_control"] = {
      init: function () {
        this.appendValueInput("SPEED")
          
          .appendField("Control Motor - Speed:");
        this.appendDummyInput()
          .appendField("Direction:")
          .appendField(
            new Blockly.FieldDropdown([
              ["Forward", "FORWARD"],
              ["Backward", "BACKWARD"],
            ]),
            "DIRECTION"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Controls the motor speed (0-255) and direction");
      },
    };
    javascriptGenerator["motor_control"] = function (block) {
      const speed =
        javascriptGenerator.valueToCode(
          block,
          "SPEED",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const direction = block.getFieldValue("DIRECTION") || "FORWARD";
      const pin = "C06";
      return `controlMotor(${speed}, "${direction}", "${pin}");\n`;
    };

    Blockly.Blocks["buzzer_frequency"] = {
      init: function () {
        this.appendValueInput("FREQUENCY")
          .setCheck("Number")
          .appendField("Play Buzzer - Frequency (Hz):");
        this.appendValueInput("DURATION")
          .setCheck("Number")
          .appendField("Duration (s):");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Plays a sound at the specified frequency for the given duration");
      },
    };
    javascriptGenerator["buzzer_frequency"] = function (block) {
      const frequency =
        javascriptGenerator.valueToCode(
          block,
          "FREQUENCY",
          javascriptGenerator.ORDER_ATOMIC
        ) || "440";
      const duration =
        javascriptGenerator.valueToCode(
          block,
          "DURATION",
          javascriptGenerator.ORDER_ATOMIC
        ) || "1";
      const pin = "C01";
      return `await playBuzzerFrequency(${frequency}, ${duration}, "${pin}");\n`;
    };

    Blockly.Blocks["led_rgb_intensity"] = {
      init: function () {
        this.appendValueInput("RED")
          .setCheck("Number")
          .appendField("Set RGB LED - Red:");
        this.appendValueInput("GREEN")
          .setCheck("Number")
          .appendField("Green:");
        this.appendValueInput("BLUE")
          .setCheck("Number")
          .appendField("Blue:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Sets the RGB LED color intensities (0-255)");
      },
    };
    javascriptGenerator["led_rgb_intensity"] = function (block) {
      const red =
        javascriptGenerator.valueToCode(
          block,
          "RED",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const green =
        javascriptGenerator.valueToCode(
          block,
          "GREEN",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const blue =
        javascriptGenerator.valueToCode(
          block,
          "BLUE",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C011";
      return `setLedRGB(${red}, ${green}, ${blue}, "${pin}");\n`;
    };

    Blockly.Blocks["oled_display"] = {
      init: function () {
        this.appendValueInput("TEXT")
          .setCheck("String")
          .appendField("Display on OLED");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Displays text on the OLED screen");
      },
    };
    javascriptGenerator["oled_display"] = function (block) {
      const text =
        javascriptGenerator.valueToCode(
          block,
          "TEXT",
          javascriptGenerator.ORDER_ATOMIC
        ) || '""';
      const pin = "C01";
      return `displayOLED(${text}, "${pin}");\n`;
    };

    Blockly.Blocks["delay"] = {
      init: function () {
        this.appendValueInput("DELAY_TIME")
          .setCheck("Number")
          .appendField("Delay (seconds)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(120);
        this.setTooltip("Pauses execution for the specified number of seconds");
      },
    };
    javascriptGenerator["delay"] = function (block) {
      const delayTime =
        javascriptGenerator.valueToCode(
          block,
          "DELAY_TIME",
          javascriptGenerator.ORDER_ATOMIC
        ) || "1";
      return `await new Promise(resolve => setTimeout(resolve, ${delayTime} * 1000));\n`;
    };

    Blockly.Blocks["alert"] = {
      init: function () {
        this.appendValueInput("MESSAGE")
          .setCheck("String")
          .appendField("Show Alert");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(160);
        this.setTooltip("Shows an alert with the specified message");
      },
    };
    javascriptGenerator["alert"] = function (block) {
      const message =
        javascriptGenerator.valueToCode(
          block,
          "MESSAGE",
          javascriptGenerator.ORDER_ATOMIC
        ) || '""';
      return `alert(${message});\n`;
    };

    Blockly.Blocks["json_object"] = {
      init: function () {
        this.appendDummyInput().appendField("Create JSON Object");
        this.appendStatementInput("KEY_VALUE_PAIRS").setCheck(null);
        this.setOutput(true, "Object");
        this.setColour(210);
        this.setTooltip("Creates a JSON object with key-value pairs");
      },
    };
    javascriptGenerator["json_object"] = function (block) {
      const statements =
        javascriptGenerator.statementToCode(block, "KEY_VALUE_PAIRS");
      return [`{${statements}}`, javascriptGenerator.ORDER_ATOMIC];
    };

    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "Start",
          colour: "#ff0000",
          contents: [{ kind: "block", type: "start" }],
        },
        {
          kind: "category",
          name: "Logic",
          colour: "#5C81A6",
          contents: [
            { kind: "block", type: "controls_if" },
            { kind: "block", type: "logic_compare" },
            { kind: "block", type: "logic_operation" },
            { kind: "block", type: "logic_boolean" },
          ],
        },
        {
          kind: "category",
          name: "Loops",
          colour: "#5CA65C",
          contents: [
            { kind: "block", type: "controls_repeat_ext" },
            { kind: "block", type: "controls_whileUntil" },
            { kind: "block", type: "delay" },
          ],
        },
        {
          kind: "category",
          name: "Math",
          colour: "#5C2D91",
          contents: [
            { kind: "block", type: "math_number" },
            { kind: "block", type: "math_arithmetic" },
            { kind: "block", type: "math_round" },
            { kind: "block", type: "math_modulo" },
            { kind: "block", type: "math_random_int" },
            { kind: "block", type: "math_trig" },
          
          ],
        },
        {
          kind: "category",
          name: "Text",
          colour: "#A65C5C",
          contents: [
            { kind: "block", type: "text" },
            { kind: "block", type: "alert" },
          ],
        },
        {
          kind: "category",
          name: "Lists",
          colour: "#745CA6",
          contents: [
            { kind: "block", type: "lists_create_with" },
            { kind: "block", type: "lists_length" },
            { kind: "block", type: "lists_getIndex" },
            { kind: "block", type: "lists_setIndex" },
            
            { kind: "block", type: "lists_reverse" },
          ],
        },
        {
          kind: "category",
          name: "JSON",
          colour: "#A6745C",
          contents: [
            { kind: "block", type: "json_object" },
          ],
        },
        {
          kind: "category",
          name: "Functions",
          colour: "#A55CA6",
          contents: [
            { kind: "block", type: "procedures_defnoreturn" },
            { kind: "block", type: "procedures_callnoreturn" },
          ],
        },
        { kind: "category", name: "Variables", colour: "#A6915C", custom: "VARIABLE" },
        {
          kind: "category",
          name: "Display",
          colour: "#0288d1",
          contents: [
            { kind: "block", type: "sevensegment" },
            { kind: "block", type: "sevensegment_display" },
            { kind: "block", type: "oled" },
            { kind: "block", type: "oled_display" },
          ],
        },
        {
          kind: "category",
          name: "Sound",
          colour: "#00897b",
          contents: [
            { kind: "block", type: "buzzer" },
            { kind: "block", type: "buzzer_frequency" },
          ],
        },
        {
          kind: "category",
          name: "Bridge",
          colour: "#2e7d32",
          contents: [
            { kind: "block", type: "bridge" },
          ],
        },
        {
          kind: "category",
          name: "Motor",
          colour: "#d81b60",
          contents: [
            { kind: "block", type: "motor" },
            { kind: "block", type: "motor_control" },
            { kind: "block", type: "pantilt" },
            { kind: "block", type: "pantilt_control" },
          ],
        },
        {
          kind: "category",
          name: "Sensor",
          colour: "#fbc02d",
          contents: [
            { kind: "block", type: "sensor" },
          ],
        },
        {
          kind: "category",
          name: "LED",
          colour: "#d32f2f",
          contents: [
            { kind: "block", type: "led" },
            { kind: "block", type: "led_rgb_intensity" },
          ],
        },
        {
          kind: "category",
          name: "Joystick",
          colour: "#7b1fa2",
          contents: [
            { kind: "block", type: "joystick" },
          ],
        },
        {
          kind: "category",
          name: "Other",
          colour: "#455a64",
          contents: [
            
           
            { kind: "block", type: "object" },
          ],
        },
      ],
    };

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox,
      grid: { spacing: 20, length: 3, colour: "#b0bec5", snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3 },
      trashcan: true,
    });
    workspaceRef.current = workspace;

    return () => {
      workspace.dispose();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [components, wires]);

  const generateCode = () => {
    if (workspaceRef.current) {
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      setGeneratedCode(code);
      console.log("Generated Code:", code);
      return code;
    }
    return "";
  };

  const runCode = async () => {
    const code = generateCode();
    try {
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }
      const context = {
        activateBUZZER,
        playBuzzerFrequency,
        activateSEVENSEGMENT,
        displaySevenSegment,
        activateSOIL_SENSOR,
        activateDIP_SWITCH,
        activatePAN_AND_TILT,
        controlPanTilt,
        activateDC_MOTOR,
        controlMotor,
        activateWEATHER_MONITORING,
        activateTRI_COLOUR_LED,
        activateULTRASONIC_SENSOR,
        activateOLED,
        displayOLED,
        activateJOYSTICK,
        readJoystick,
        activateSMARTLIGHT,
        smartLightVibgyor,
        setLedRGB,
        measureDistanceWrapper: () => measureDistance(components, setOutputLog),
        alert: (msg) => {
          window.alert(msg);
          setOutputLog((prev) => [...prev, `Alert: ${msg}`]);
        },
      };
      const asyncFunc = new Function(
        ...Object.keys(context),
        `return (async () => {\n${code}\n})();`
      );
      await asyncFunc(...Object.values(context));
      setSnackbarOpen(true);
      checkConnection();
    } catch (error) {
      setOutputLog((prev) => [...prev, `Error: ${error.message}`]);
      console.error(error);
    }
  };

  const testSevenSegment = () => {
    displaySevenSegment(4, "C03");
  };

  const testOLED = () => {
    displayOLED("Test", "C01");
  };

  const testPanTilt = () => {
    controlPanTilt(90, 45, "C09");
  };

  const testLED = () => {
    setLedRGB(255, 0, 0, "C011");
  };

  const testMotor = () => {
    controlMotor(255, "FORWARD", "C06");
  };

  const testBuzzer = () => {
    playBuzzerFrequency(440, 1, "C01");
  };

  const testJoystick = () => {
    activateJOYSTICK("C10");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
          }}
        >
          <AppBar
            position="static"
            sx={{ background: "linear-gradient(to right, #0288d1, #4fc3f7)" }}
          >
            <Toolbar>
              <Typography
                variant="h5"
                sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: 1 }}
              >
                Sheshgyan Simulator
              </Typography>
             
              <Button
                color="inherit"
                onClick={runCode}
                startIcon={<PlayArrowIcon />}
              >
                Run Code
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", gap: 3, height: "80vh" }}>
              <Box
                sx={{
                  width: isMinimized ? "100%" : "50%",
                  bgcolor: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                  p: 3,
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: "#0288d1", fontWeight: 500 }}
                >
                  Blockly Editor
                </Typography>
                <div
                  ref={blocklyDiv}
                  style={{
                    height: "calc(100% - 40px)",
                    width: "100%",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                />
              </Box>

              {!isMinimized && (
                <Box sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      borderRadius: 3,
                      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                      p: 3,
                      flex: "0 0 auto",
                      maxHeight: "30%",
                      overflowY: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "#0288d1", fontWeight: 500 }}
                      >
                        Components Store
                      </Typography>
                      <IconButton onClick={() => setIsMinimized(true)}>
                        <MinimizeIcon />
                      </IconButton>
                    </Box>
                    <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                      <Tab label="Bridge" />
                      <Tab label="LEDs" />
                      <Tab label="Display" />
                      <Tab label="Sensors" />
                      <Tab label="Sound" />
                      <Tab label="Motor Driver" />
                      <Tab label="Joystick" />
                      <Tab label="Other" />
                    </Tabs>
                    <Box sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        {Object.keys(categories).map((category, index) => (
                          tabValue === index &&
                          componentsList
                            .filter((comp) => categories[category].includes(comp.type))
                            .map((comp) => (
                              <Grid item xs={4} key={comp.id}>
                                <DraggableComponent
                                  id={comp.id}
                                  name={comp.name}
                                  type={comp.type}
                                  image={comp.image}
                                  defaultPin={comp.defaultPin}
                                  onAddComponent={(id, name, type, image) =>
                                    handleAddComponent(id, name, type, image, comp.defaultPin)
                                  }
                                />
                              </Grid>
                            ))
                        ))}
                      </Grid>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "#fff",
                      borderRadius: 3,
                      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                      p: 3,
                      flex: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, color: "#0288d1", fontWeight: 500 }}
                    >
                      Workspace
                    </Typography>
                    <Workspace
                      components={components}
                      setComponents={setComponents}
                      wires={wires}
                      setWires={setWires}
                    />
                  </Box>
                </Box>
              )}

              {isMinimized && (
                <IconButton
                  onClick={() => setIsMinimized(false)}
                  sx={{ position: "absolute", right: 20, top: 80 }}
                >
                  <MaximizeIcon />
                </IconButton>
              )}
            </Box>

            <Dialog open={openSessionsDialog} onClose={() => setOpenSessionsDialog(false)}>
              <DialogTitle>Load Session</DialogTitle>
              <DialogContent>
                <List>
                  {sessions.map((session) => (
                    <ListItem
                      button
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                    >
                      <ListItemText primary={session.name} />
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
            </Dialog>

            <Snackbar
              open={snackbarOpen}
              autoHideDuration={3000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
                Action completed successfully!
              </Alert>
            </Snackbar>

            <Box sx={{ mt: 4, bgcolor: "#fff", borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#0288d1" }}>
                Output Log
              </Typography>
              <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                {outputLog.map((log, index) => (
                  <Typography key={index} variant="body2">
                    {log}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>
      </DndProvider>
    </ThemeProvider>
  );
};

export default IoTSimulator;
