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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MinimizeIcon from "@mui/icons-material/Minimize";
import MaximizeIcon from "@mui/icons-material/Maximize";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 8,
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          "&:before": { display: "none" },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#f5faff",
          "&:hover": { backgroundColor: "#e3f2fd" },
        },
        content: {
          alignItems: "center",
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: 16,
          backgroundColor: "#fff",
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
  },
});

const IoTSimulator = () => {
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [outputLog, setOutputLog] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(false);
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
    "C02": { device: "SEVENSEGMENT", description: "It is showing the number." },
    "C03": { device: "SOIL_SENSOR", description: "It is reading soil data." },
    "C04": { device: "DIP_SWITCH", description: "It is toggled." },
    "C05": { device: "PAN_AND_TILT", description: "The servo will rotate." },
    "C06": { device: "WEATHER_MONITORING", description: "It senses temperature and humidity." },
    "C07": { device: "DC_MOTOR", description: "The motor will spin." },
    "C08": { device: "ULTRASONIC_SENSOR", description: "It senses the obstacle." },
    "C09": { device: "OLED", description: "It is showing the picture and number." },
    "C10": { device: "JOYSTICK", description: "It is showing the X-axis and Y-axis values." },
    "C11": { device: "TRI_COLOUR_LED", description: "The LED will glow." },
    "C12": { device: "SMARTLIGHT", description: "It displays VIBGYOR colors." },
  };

  const componentsList = [
    { id: 1, name: "IoT Bridge", type: "bridge", image: bridgeImage, category: "Bridge", defaultPin: "C01" },
    { id: 2, name: "RGB LED", type: "led", image: ledImage, category: "LED", defaultPin: "C011" },
    { id: 3, name: "Ultrasonic Sensor", type: "sensor", image: sensorImage, category: "sensor", defaultPin: "C08" },
    { id: 4, name: "DC Motor", type: "motor", image: motorImage, category: "Motor", defaultPin: "C07" },
    { id: 5, name: "Buzzer", type: "buzzer", image: buzzerImage, category: "Sound", defaultPin: "C01" },
    { id: 6, name: "Joystick", type: "joystick", image: joystickImage, category: "Joystick", defaultPin: "C10" },
    { id: 7, name: "Smart LED", type: "smartlight", image: smartLightImage, category: "LED", defaultPin: "C12" },
    { id: 8, name: "7-Segment", type: "sevensegment", image: sevenSegmentImage, category: "Display", defaultPin: "C02" },
    { id: 9, name: "Pan & Tilt", type: "pantilt", image: panTiltImage, category: "Servo", defaultPin: "C05" },
    { id: 10, name: "Audio", type: "audioplayer", image: audioplayerImage, category: "Other", defaultPin: "C03" },
    { id: 11, name: "OLED", type: "oled", image: oledImage, category: "Display", defaultPin: "C09" },
    { id: 12, name: "LDR", type: "ldr", image: ldrImage, category: "Other", defaultPin: "C04" },
    { id: 13, name: "Object", type: "object", image: objectImage, category: "Other", defaultPin: "C06" },
  ];

  const categories = [
    { name: "Display", components: ["sevensegment", "oled"] },
    { name: "Sound", components: ["buzzer"] },
    { name: "Bridge", components: ["bridge"] },
    { name: "Motor", components: ["motor"] },
    { name: "Sensor", components: ["sensor"] },
    { name: "LED", components: ["led", "smartlight"] },
    { name: "Joystick", components: ["joystick"] },
    { name: "Servo", components: ["pantilt"] },
    { name: "Other", components: ["ldr", "audioplayer", "object"] },
  ];

  const handleCategoryExpand = (panel) => (event, isExpanded) => {
    setExpandedCategory(isExpanded ? panel : false);
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

    const bridge = components.find((comp) => comp.type === "bridge");
    if (!bridge) {
      console.warn("No bridge component found");
    }

    let component = null;
    if (bridge) {
      const wire = wires.find(
        (w) =>
          (w.sourceId === bridge.id && w.sourcePin === bridgePin) ||
          (w.targetId === bridge.id && w.targetPin === bridgePin)
      );
      if (wire) {
        const componentId = wire.sourceId === bridge.id ? wire.targetId : wire.sourceId;
        component = components.find(
          (comp) => comp.id === componentId && comp.type === componentType
        );
      }
    }

    if (!component) {
      component = components.find(
        (comp) =>
          comp.type === componentType &&
          wires.some(
            (w) =>
              (w.sourceId === comp.id || w.targetId === comp.id) &&
              (w.sourcePin === bridgePin || w.targetPin === bridgePin)
          )
      );
    }

    if (!component) {
      component = components.find(
        (comp) => comp.type === componentType && comp.pin === bridgePin
      );
    }

    if (component) {
      console.log(`Found ${componentType} (ID: ${component.id}) for pin ${bridgePin}`);
    } else {
      console.warn(`No ${componentType} found for pin ${bridgePin}`);
    }
    return component;
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

  const measureDistance = (components, setOutputLog) => {
    const sensor = components.find((comp) => comp.type === "sensor");
    const object = components.find((comp) => comp.type === "object");
    if (sensor && object) {
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
        pin: defaultPin, // Assign the default pin when adding the component
        state: null,
        value: type === "sevensegment" ? 0 : null,
        angle: type === "pantilt" ? { pan: 0, tilt: 0 } : null,
        speed: type === "motor" ? 0 : null,
        direction: type === "motor" ? "forward" : null,
        displayText: type === "oled" ? "" : null,
        xValue: type === "joystick" ? 0 : null,
        yValue: type === "joystick" ? 0 : null,
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
      return [...prev, newWire];
    });
  };

  const checkConnection = () => {
    console.log("Checking connections...");
    const bridge = components.find((comp) => comp.type === "bridge");
    if (!bridge) {
      console.warn("No bridge component found in checkConnection");
      return;
    }

    components.forEach((comp) => {
      if (comp.type === "bridge" || !comp.pin) return;
      const deviceInfo = pinDeviceMap[comp.pin];
      const wireExists = wires.some(
        (w) =>
          (w.sourceId === bridge.id && w.targetId === comp.id && w.sourcePin === comp.pin) ||
          (w.targetId === bridge.id && w.sourceId === comp.id && w.targetPin === comp.pin)
      );
      if (!wireExists) {
        addWire(bridge.id, comp.id, comp.pin, comp.pin);
      }
      if (deviceInfo) {
        const logMessage = `IoT Bridge connected to ${comp.name} on pin ${comp.pin}: ${deviceInfo.description}`;
        setOutputLog((prev) => {
          if (!prev.includes(logMessage)) return [...prev, logMessage];
          return prev;
        });
        updateComponentState(comp.id, {
          state: deviceInfo.device === "TRI_COLOUR_LED" ? "glowing" : "active",
        });
      }
      if (comp.type === "led" && comp.pin === "C011" && bridge.pin === "C11") {
        setOutputLog((prev) => [
          ...prev,
          `IoT Bridge C11 connected to RGB LED C011: Red light glowing`,
        ]);
        updateComponentState(comp.id, {
          state: "glowing",
          color: "red",
          r: 255,
          g: 0,
          b: 0,
        });
        if (!wireExists) {
          addWire(bridge.id, comp.id, "C11", "C011");
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
        state: comp.state,
        value: comp.value,
        angle: comp.angle,
        speed: comp.speed,
        direction: comp.direction,
        displayText: comp.displayText,
        xValue: comp.xValue,
        yValue: comp.yValue,
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
        state: comp.state,
        value: comp.value,
        angle: comp.angle,
        speed: comp.speed,
        direction: comp.direction,
        displayText: comp.displayText,
        xValue: comp.xValue,
        yValue: comp.yValue,
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

    componentsList.forEach((comp) => {
      Blockly.Blocks[comp.type] = {
        init: function () {
          this.appendDummyInput().appendField(comp.name);
          // Removed pin dropdown; defaultPin is now used in the generator
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(180);
        },
      };
      javascriptGenerator[comp.type] = function () {
        const pin = comp.defaultPin; // Use the default pin from componentsList
        const device = pinDeviceMap[pin]?.device || comp.type.toUpperCase();
        return `activate${device}("${pin}");\n`;
      };
    });

    Blockly.Blocks["sevensegment_display"] = {
      init: function () {
        this.appendValueInput("NUMBER")
          .setCheck("Number")
          .appendField("Display on 7-Segment");
        // Removed pin dropdown
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
      const pin = "C02"; // Default pin from testSevenSegment
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
        // Removed pin dropdown
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
      const pin = "C05"; // Default pin from testPanTilt
      return `controlPanTilt(${pan}, ${tilt}, "${pin}");\n`;
    };

    Blockly.Blocks["motor_control"] = {
      init: function () {
        this.appendValueInput("SPEED")
          .setCheck("Number")
          .appendField("DC Motor Speed (0-255):");
        this.appendDummyInput()
          .appendField("Direction")
          .appendField(
            new Blockly.FieldDropdown([
              ["Forward", "FORWARD"],
              ["Backward", "BACKWARD"],
            ]),
            "DIRECTION"
          );
        // Removed pin dropdown
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Controls DC motor speed and direction");
      },
    };
    javascriptGenerator["motor_control"] = function (block) {
      const speed =
        javascriptGenerator.valueToCode(
          block,
          "SPEED",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const direction = block.getFieldValue("DIRECTION");
      const pin = "C07"; // Default pin from testMotor
      return `controlMotor(${speed}, "${direction}", "${pin}");\n`;
    };

    Blockly.Blocks["oled_display"] = {
      init: function () {
        this.appendValueInput("TEXT")
          .setCheck(["String", "Number"])
          .appendField("Display on OLED:");
        // Removed pin dropdown
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Displays text or number on OLED");
      },
    };
    javascriptGenerator["oled_display"] = function (block) {
      const text =
        javascriptGenerator.valueToCode(
          block,
          "TEXT",
          javascriptGenerator.ORDER_ATOMIC
        ) || '""';
      const pin = "C09"; // Default pin from testOLED
      return `displayOLED(${text}, "${pin}");\n`;
    };

    Blockly.Blocks["smartlight_vibgyor"] = {
      init: function () {
        this.appendDummyInput().appendField("Smart Light VIBGYOR");
        // Removed pin dropdown
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["smartlight_vibgyor"] = function () {
      const pin = "C12"; // Default pin from pinDeviceMap for SMARTLIGHT
      return `smartLightVibgyor("${pin}");\n`;
    };

    Blockly.Blocks["led_rgb_intensity"] = {
      init: function () {
        this.appendValueInput("R").setCheck("Number").appendField("Tri-Color LED R:");
        this.appendValueInput("G").setCheck("Number").appendField("G:");
        this.appendValueInput("B").setCheck("Number").appendField("B:");
        // Removed pin dropdown
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["led_rgb_intensity"] = function (block) {
      const r =
        javascriptGenerator.valueToCode(block, "R", javascriptGenerator.ORDER_ATOMIC) ||
        "0";
      const g =
        javascriptGenerator.valueToCode(block, "G", javascriptGenerator.ORDER_ATOMIC) ||
        "0";
      const b =
        javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) ||
        "0";
      const pin = "C011"; // Default pin from testLED
      return `setLedRGB(${r}, ${g}, ${b}, "${pin}");\n`;
    };

    Blockly.Blocks["buzzer_frequency"] = {
      init: function () {
        this.appendValueInput("FREQ")
          .setCheck("Number")
          .appendField("Buzzer Frequency (Hz):");
        this.appendValueInput("DURATION")
          .setCheck("Number")
          .appendField("Duration (s):");
        // Removed pin dropdown
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["buzzer_frequency"] = function (block) {
      const freq =
        javascriptGenerator.valueToCode(
          block,
          "FREQ",
          javascriptGenerator.ORDER_ATOMIC
        ) || "440";
      const duration =
        javascriptGenerator.valueToCode(
          block,
          "DURATION",
          javascriptGenerator.ORDER_ATOMIC
        ) || "1";
      const pin = "C01"; // Default pin from testBuzzer
      return `await playBuzzerFrequency(${freq}, ${duration}, "${pin}");\n`;
    };

    Blockly.Blocks["controls_if"] = {
      init: function () {
        this.appendValueInput("IF0").setCheck("Boolean").appendField("if");
        this.appendStatementInput("DO0").appendField("do");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(210);
      },
    };
    javascriptGenerator["controls_if"] = function (block) {
      const condition =
        javascriptGenerator.valueToCode(
          block,
          "IF0",
          javascriptGenerator.ORDER_ATOMIC
        ) || "false";
      const statements = javascriptGenerator.statementToCode(block, "DO0");
      return `if (${condition}) {\n${statements}}\n`;
    };

    Blockly.Blocks["logic_compare"] = {
      init: function () {
        this.appendValueInput("A").setCheck("Number");
        this.appendDummyInput().appendField(
          new Blockly.FieldDropdown([
            ["=", "EQ"],
            ["≠", "NEQ"],
            ["<", "LT"],
            [">", "GT"],
            ["≤", "LTE"],
            ["≥", "GTE"],
          ]),
          "OP"
        );
        this.appendValueInput("B").setCheck("Number");
        this.setOutput(true, "Boolean");
        this.setColour(210);
      },
    };
    javascriptGenerator["logic_compare"] = function (block) {
      const operator = block.getFieldValue("OP");
      const a =
        javascriptGenerator.valueToCode(block, "A", javascriptGenerator.ORDER_ATOMIC) ||
        "0";
      const b =
        javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) ||
        "0";
      const ops = { EQ: "==", NEQ: "!=", LT: "<", GT: ">", LTE: "<=", GTE: ">=" };
      return [`${a} ${ops[operator]} ${b}`, javascriptGenerator.ORDER_RELATIONAL];
    };

    Blockly.Blocks["logic_operation"] = {
      init: function () {
        this.appendValueInput("A").setCheck("Boolean");
        this.appendDummyInput().appendField(
          new Blockly.FieldDropdown([
            ["and", "AND"],
            ["or", "OR"],
          ]),
          "OP"
        );
        this.appendValueInput("B").setCheck("Boolean");
        this.setOutput(true, "Boolean");
        this.setColour(210);
      },
    };
    javascriptGenerator["logic_operation"] = function (block) {
      const operator = block.getFieldValue("OP");
      const a =
        javascriptGenerator.valueToCode(block, "A", javascriptGenerator.ORDER_ATOMIC) ||
        "false";
      const b =
        javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) ||
        "false";
      const ops = { AND: "&&", OR: "||" };
      return [`${a} ${ops[operator]} ${b}`, javascriptGenerator.ORDER_LOGICAL_AND];
    };

    Blockly.Blocks["logic_boolean"] = {
      init: function () {
        this.appendDummyInput().appendField(
          new Blockly.FieldDropdown([
            ["true", "TRUE"],
            ["false", "FALSE"],
          ]),
          "BOOL"
        );
        this.setOutput(true, "Boolean");
        this.setColour(210);
      },
    };
    javascriptGenerator["logic_boolean"] = function (block) {
      return [
        block.getFieldValue("BOOL") === "TRUE" ? "true" : "false",
        javascriptGenerator.ORDER_ATOMIC,
      ];
    };

    Blockly.Blocks["controls_repeat_ext"] = {
      init: function () {
        this.appendValueInput("TIMES").setCheck("Number").appendField("repeat");
        this.appendStatementInput("DO").appendField("times");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(120);
      },
    };
    javascriptGenerator["controls_repeat_ext"] = function (block) {
      const times =
        javascriptGenerator.valueToCode(
          block,
          "TIMES",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const statements = javascriptGenerator.statementToCode(block, "DO");
      return `for (let i = 0; i < ${times}; i++) {\n${statements}}\n`;
    };

    Blockly.Blocks["controls_whileUntil"] = {
      init: function () {
        this.appendValueInput("BOOL").setCheck("Boolean").appendField("while");
        this.appendStatementInput("DO").appendField("do");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(120);
      },
    };
    javascriptGenerator["controls_whileUntil"] = function (block) {
      const bool =
        javascriptGenerator.valueToCode(
          block,
          "BOOL",
          javascriptGenerator.ORDER_ATOMIC
        ) || "false";
      const statements = javascriptGenerator.statementToCode(block, "DO");
      return `while (${bool}) {\n${statements}}\n`;
    };

    Blockly.Blocks["math_number"] = {
      init: function () {
        this.appendDummyInput().appendField(new Blockly.FieldNumber(0), "NUM");
        this.setOutput(true, "Number");
        this.setColour(230);
      },
    };
    javascriptGenerator["math_number"] = function (block) {
      const number = block.getFieldValue("NUM");
      return [number, javascriptGenerator.ORDER_ATOMIC];
    };

    Blockly.Blocks["math_arithmetic"] = {
      init: function () {
        this.appendValueInput("A").setCheck("Number");
        this.appendDummyInput().appendField(
          new Blockly.FieldDropdown([
            ["+", "ADD"],
            ["-", "MINUS"],
            ["×", "MULTIPLY"],
            ["÷", "DIVIDE"],
          ]),
          "OP"
        );
        this.appendValueInput("B").setCheck("Number");
        this.setOutput(true, "Number");
        this.setColour(230);
      },
    };
    javascriptGenerator["math_arithmetic"] = function (block) {
      const operator = block.getFieldValue("OP");
      const a =
        javascriptGenerator.valueToCode(block, "A", javascriptGenerator.ORDER_ATOMIC) ||
        "0";
      const b =
        javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) ||
        "0";
      const ops = { ADD: "+", MINUS: "-", MULTIPLY: "*", DIVIDE: "/" };
      return [`${a} ${ops[operator]} ${b}`, javascriptGenerator.ORDER_ADDITION];
    };

    Blockly.Blocks["text"] = {
      init: function () {
        this.appendDummyInput().appendField(new Blockly.FieldTextInput(""), "TEXT");
        this.setOutput(true, "String");
        this.setColour(160);
      },
    };
    javascriptGenerator["text"] = function (block) {
      const text = block.getFieldValue("TEXT");
      return [`"${text}"`, javascriptGenerator.ORDER_ATOMIC];
    };

    Blockly.Blocks["variables_get"] = {
      init: function () {
        this.appendDummyInput().appendField(new Blockly.FieldVariable("var"), "VAR");
        this.setOutput(true, null);
        this.setColour(330);
      },
    };
    javascriptGenerator["variables_get"] = function (block) {
      const varName = javascriptGenerator.nameDB_.getName(
        block.getFieldValue("VAR"),
        Blockly.Names.NameType.VARIABLE
      );
      return [varName, javascriptGenerator.ORDER_ATOMIC];
    };

    Blockly.Blocks["variables_set"] = {
      init: function () {
        this.appendValueInput("VALUE")
          .appendField("set")
          .appendField(new Blockly.FieldVariable("var"), "VAR")
          .appendField("to");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(330);
      },
    };
    javascriptGenerator["variables_set"] = function (block) {
      const varName = javascriptGenerator.nameDB_.getName(
        block.getFieldValue("VAR"),
        Blockly.Names.NameType.VARIABLE
      );
      const value =
        javascriptGenerator.valueToCode(
          block,
          "VALUE",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      return `let ${varName} = ${value};\n`;
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
          ],
        },
        {
          kind: "category",
          name: "Math",
          colour: "#5C2D91",
          contents: [
            { kind: "block", type: "math_number" },
            { kind: "block", type: "math_arithmetic" },
          ],
        },
        {
          kind: "category",
          name: "Text",
          colour: "#A65C5C",
          contents: [{ kind: "block", type: "text" }],
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
            { kind: "block", type: "smartlight" },
            { kind: "block", type: "smartlight_vibgyor" },
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
          name: "Servo",
          colour: "#388e3c",
          contents: [
            { kind: "block", type: "pantilt" },
            { kind: "block", type: "pantilt_control" },
          ],
        },
        {
          kind: "category",
          name: "Other",
          colour: "#455a64",
          contents: [
            { kind: "block", type: "ldr" },
            { kind: "block", type: "audioplayer" },
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
    displaySevenSegment(4, "C02");
  };

  const testOLED = () => {
    displayOLED("Test", "C09");
  };

  const testPanTilt = () => {
    controlPanTilt(90, 45, "C05");
  };

  const testLED = () => {
    setLedRGB(255, 0, 0, "C011");
  };

  const testMotor = () => {
    controlMotor(255, "FORWARD", "C07");
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
                        IoT Components
                      </Typography>
                      <IconButton onClick={() => setIsMinimized(true)}>
                        <MinimizeIcon />
                      </IconButton>
                    </Box>
                    <Accordion
                      expanded={expandedCategory === "all"}
                      onChange={handleCategoryExpand("all")}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography sx={{ color: "#0288d1", fontWeight: 500 }}>
                          All Components
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          {componentsList.map((comp) => (
                            <Grid item xs={4} key={comp.id}>
                              <DraggableComponent
                                id={comp.id}
                                name={comp.name}
                                type={comp.type}
                                image={comp.image}
                                defaultPin={comp.defaultPin} // Pass defaultPin to DraggableComponent
                                onAddComponent={(id, name, type, image) =>
                                  handleAddComponent(id, name, type, image, comp.defaultPin)
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                    {categories.map((category) => (
                      <Accordion
                        key={category.name}
                        expanded={expandedCategory === category.name}
                        onChange={handleCategoryExpand(category.name)}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography sx={{ color: "#0288d1", fontWeight: 500 }}>
                            {category.name}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={2}>
                            {componentsList
                              .filter((comp) => category.components.includes(comp.type))
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
                              ))}
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ))}
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

            <Box
              sx={{
                mt: 3,
                p: 3,
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#0288d1", fontWeight: 500 }}
              >
                Output Log
              </Typography>
              {outputLog.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No output yet...
                </Typography>
              ) : (
                outputLog.map((log, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: "monospace",
                      color: log.includes("Error") ? "#d32f2f" : "#333",
                    }}
                  >
                    {log}
                  </Typography>
                ))
              )}
            </Box>
          </Container>

          <Dialog
            open={openSessionsDialog}
            onClose={() => setOpenSessionsDialog(false)}
          >
            <DialogTitle>Load Previous Sessions</DialogTitle>
            <DialogContent>
              {sessions.length === 0 ? (
                <Typography>No saved sessions found</Typography>
              ) : (
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
              )}
            </DialogContent>
          </Dialog>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              severity="success"
              onClose={() => setSnackbarOpen(false)}
              sx={{ width: "100%", borderRadius: 2 }}
            >
              {sessions.length > 0 && !openSessionsDialog
                ? "Session saved successfully!"
                : "Code executed successfully!"}
            </Alert>
          </Snackbar>
        </Box>
      </DndProvider>
    </ThemeProvider>
  );
};

export default IoTSimulator;
