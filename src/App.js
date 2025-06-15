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
import objectImage from "./assets/object.svg";
import oledImage from "./assets/oled.svg";
import sensorImage from "./assets/sensor.png";
import ledImage from "./assets/led.png";
import motorImage from "./assets/motor.png";
import buzzerImage from "./assets/buzzer.png";
import joystickImage from "./assets/joystick.png";
import sevenSegmentImage from "./assets/sevensegmentdisplay.png";
import panTiltImage from "./assets/panandtilt.png";
import smartLightComponentImage from "./assets/smartlight.jpeg"; // New image for SmartLightComponent
import smartLightLedImage from "./assets/smart.png";

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "./App.css";
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      console.error('ErrorBoundary caught:', this.state.error);
      return <div>Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}
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
  const [isStoreMinimized, setIsStoreMinimized] = useState(true); // Start minimized
  const [previousTabValue, setPreviousTabValue] = useState(null); // Store previous tab
  
  const [isMinimizedStore, setIsMinimizedStore] = useState(true);
  const [isMinimizedBlockly, setIsMinimizedBlockly] = useState(false);
  const [isMinimizedWorkspace, setIsMinimizedWorkspace] = useState(false);

  const esp32Pins = [
    "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12"
  ];
  const rgbLedPins = ["C011", "C012", "C013"];
  const sensorPins = ["C08", "VCC", "GND"];
  const joystickPins = ["VRX", "VRY", "SW"];
  const smartLightPins = ["C01"];

  const pinDeviceMap = {
    "C01": { device: "BUZZER", description: "The buzzer will turn on with sound." },
    "C01": { device: "SMARTLIGHT", description: "The buzzer will turn on with sound." },
    "C03": { device: "SEVENSEGMENT", description: "It is showing the number or letter." },
    "C02": { device: "SOIL_SENSOR", description: "It is reading soil data." },
    "C04": { device: "DIP_SWITCH", description: "It is toggled." },
    "C09": { device: "PAN_AND_TILT", description: "The servo will rotate." },
    "C06": { device: "DC_MOTOR", description: "The motor will spin." },
    "C12": { device: "ULTRASONIC_SENSOR", description: "It senses the obstacle." },
    "C01": { device: "OLED", description: "It is showing graphics or text." },
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
    { id: 13, name: "Object", type: "object", image: objectImage, category: "Other", defaultPin: "C12" },
    { id: 14, name: "SmartLightComponent", type: "smartlightcomponent", image: smartLightComponentImage, category: "LED", defaultPin: "C001" },
    { id: 15, name: "SmartLightLED", type: "smartlightled", image: smartLightLedImage, category: "LED", defaultPin: "C001" },
  ];
  
  const categories = {
    Bridge: ["bridge"],
    LED: ["led", "smartlightcomponent","smartlightled"],
    Display: ["sevensegment", "oled"],
    Sensor: ["sensor"],
    Sound: ["buzzer"],
    Motor: ["motor", "pantilt"],
    Joystick: ["joystick"],
    Other: ["object"],
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
    }

    const componentByConnectedPins = components.find(
      (comp) =>
        comp.type === componentType &&
        comp.connectedPins?.some((pin) => normalizePin(pin) === normalizedBridgePin)
    );
    if (componentByConnectedPins) {
      console.log(`Found ${componentType} (ID: ${componentByConnectedPins.id}) via connectedPins for pin ${bridgePin}`);
      return componentByConnectedPins;
    }

    console.warn(`No ${componentType} found for pin ${bridgePin}`);
    return null;
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

  const setSmartLightColor = async (color, seconds, power, pin) => {
    console.log(`Setting Smart Light color to ${color} for ${seconds}s with power ${power} on pin ${pin}`);
    const colorMap = {
      red: { r: 255, g: 0, b: 0 },
      green: { r: 0, g: 255, b: 0 },
      blue: { r: 0, g: 0, b: 255 },
      yellow: { r: 255, g: 255, b: 0 },
      cyan: { r: 0, g: 255, b: 255 },
      magenta: { r: 255, g: 0, b: 255 },
      white: { r: 255, g: 255, b: 255 },
    };
    const rgb = colorMap[color.toLowerCase()] || { r: 255, g: 255, b: 255 };
    const duration = parseFloat(seconds) * 1000;
    const powerState = power.toLowerCase() === "on" ? 1 : 0;

    setOutputLog((prev) => [...prev, `Smart Light on pin ${pin}: Set to ${color} for ${seconds}s, Power: ${power}`]);
    const component = findComponentByBridgePin(pin, "smartlight");
    if (component) {
      updateComponentState(component.id, {
        state: powerState ? "glowing" : "off",
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        duration: seconds,
        power: powerState,
        pin,
      });

      if (powerState && duration > 0) {
        await new Promise((resolve) => setTimeout(resolve, duration));
        updateComponentState(component.id, {
          state: "off",
          r: 0,
          g: 0,
          b: 0,
          pin,
        });
        setOutputLog((prev) => [...prev, `Smart Light on pin ${pin}: Turned off after ${seconds}s`]);
      }
    } else {
      setOutputLog((prev) => [...prev, `Error: No Smart Light found for pin ${pin}`]);
    }
    checkConnection();
  };

     // Smart Light VIBGYOR Block
Blockly.Blocks["smartlight_vibgyor"] = {
  init: function () {
    this.appendDummyInput().appendField("Smart Light VIBGYOR");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(180);
    this.setTooltip("Displays VIBGYOR colors on Smart Light");
  },
};
javascriptGenerator["smartlight_vibgyor"] = function (block) {
  return `smartLightVibgyor("c001");\n`;
};

// SmartLightLED Colour Seconds Block
Blockly.Blocks["smartlightled_colour_seconds"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("SmartLightLED")
      .appendField(new Blockly.FieldDropdown([
        ["LED1", "LED1"], ["LED2", "LED2"]
      ]), "LED");
    this.appendDummyInput()
      .appendField("Colour")
      .appendField(new Blockly.FieldDropdown([
        ["Red", "red"], ["Green", "green"], ["Blue", "blue"], ["White", "white"]
      ]), "COLOUR");
    this.appendValueInput("SECONDS").setCheck("Number").appendField("for");
    this.appendDummyInput().appendField("seconds");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(180);
    this.setTooltip("Set SmartLightLED to a colour for a specified duration");
  },
};
javascriptGenerator["smartlightled_colour_seconds"] = function (block) {
  const led = block.getFieldValue("LED");
  const colour = block.getFieldValue("COLOUR");
  const seconds = javascriptGenerator.valueToCode(block, "SECONDS", javascriptGenerator.ORDER_ATOMIC) || "0";
  return `setSmartLightLedColourSeconds("${led}", "${colour}", ${seconds}, "c001");\n`;
};

// SmartLightLED Colour Power Dropdown Block
Blockly.Blocks["smartlightled_colour_power"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("SmartLightLED")
      .appendField(new Blockly.FieldDropdown([
        ["LED1", "LED1"], ["LED2", "LED2"], ["LED3", "LED3"],
        ["LED4", "LED4"], ["LED5", "LED5"], ["LED6", "LED6"], ["LED7", "LED7"]
      ]), "LEDLEVEL");
    this.appendDummyInput()
      .appendField("Colour")
      .appendField(new Blockly.FieldDropdown([
        ["Red", "red"], ["Green", "green"], ["Blue", "blue"], ["White", "white"]
      ]), "COLOUR");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(180);
    this.setTooltip("Set SmartLightLED colour and brightness based on LED level (1-7)");
  },
};
javascriptGenerator["smartlightled_colour_power"] = function (block) {
  const ledLevel = block.getFieldValue("LEDLEVEL");
  const colour = block.getFieldValue("COLOUR");

  // Map LED level to brightness percentage
  const brightnessMap = {
    LED1: 20,
    LED2: 35,
    LED3: 50,
    LED4: 65,
    LED5: 80,
    LED6: 90,
    LED7: 100
  };
  const power = brightnessMap[ledLevel];

  return `setSmartLightLedColourPower("${ledLevel}", "${colour}", ${power}, "c001");\n`;
};


// SmartLightLED Dropdown Colour Dropdown Power Dropdown Block
Blockly.Blocks["smartlightled_dropdown_colour_power"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("SmartLightLED")
      .appendField(new Blockly.FieldDropdown([
        ["LED1", "LED1"], ["LED2", "LED2"]
      ]), "LED");
    this.appendDummyInput()
      .appendField("Colour")
      .appendField(new Blockly.FieldDropdown([
        ["Red", "red"], ["Green", "green"], ["Blue", "blue"], ["White", "white"]
      ]), "COLOUR");
    this.appendDummyInput()
      .appendField("Power")
      .appendField(new Blockly.FieldDropdown([
        ["ON", "100"], ["OFF", "0"]
      ]), "POWER");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(180);
    this.setTooltip("Set SmartLightLED with dropdown for colour and power");
  },
};
javascriptGenerator["smartlightled_dropdown_colour_power"] = function (block) {
  const led = block.getFieldValue("LED");
  const colour = block.getFieldValue("COLOUR");
  const power = block.getFieldValue("POWER");
  return `setSmartLightLedDropdownColourPower("${led}", "${colour}", ${power}, "c001");\n`;
};

  const setSmartLightLed = (led, color, power, pin) => {
    console.log(`Setting Smart Light LED ${led} to color ${color} with power ${power} on pin ${pin}`);
    const colorMap = {
      red: { r: 255, g: 0, b: 0 },
      green: { r: 0, g: 255, b: 0 },
      blue: { r: 0, g: 0, b: 255 },
      yellow: { r: 255, g: 255, b: 0 },
      cyan: { r: 0, g: 255, b: 255 },
      magenta: { r: 255, g: 0, b: 255 },
      white: { r: 255, g: 255, b: 255 },
    };
    const rgb = colorMap[color.toLowerCase()] || { r: 255, g: 255, b: 255 };
    const powerState = power.toLowerCase() === "on" ? 1 : 0;

    setOutputLog((prev) => [...prev, `Smart Light LED ${led} on pin ${pin}: Set to ${color}, Power: ${power}`]);
    const component = findComponentByBridgePin(pin, "smartlight");
    if (component) {
      updateComponentState(component.id, {
        state: powerState ? "glowing" : "off",
        led: led,
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        power: powerState,
        pin,
      });
    } else {
      setOutputLog((prev) => [...prev, `Error: No Smart Light found for pin ${pin}`]);
    }
    checkConnection();
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
   window.playBuzzerSareGamaPa = async (pin) => {
    console.log(`Playing Sare Gama Pa on BUZZER on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: Playing Sare Gama Pa`]);
  
    const notes = [
      { freq: 261.63, duration: 0.3 }, // C4
      { freq: 293.66, duration: 0.3 }, // D4
      { freq: 329.63, duration: 0.3 }, // E4
      { freq: 349.23, duration: 0.3 }, // F4
      { freq: 392.00, duration: 0.3 }, // G4
      { freq: 440.00, duration: 0.3 }, // A4
      { freq: 493.88, duration: 0.3 }, // B4
      { freq: 523.25, duration: 0.3 }, // C5
    ];
  
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
  
      for (const note of notes) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
  
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
  
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(note.freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  
        oscillator.start();
        await new Promise((resolve) => setTimeout(resolve, note.duration * 1000));
        oscillator.stop();
      }
  
      const component = findComponentByBridgePin(pin, "buzzer");
      if (component) {
        updateComponentState(component.id, { state: "played_music", song: "Sare Gama Pa", pin });
      }
    } catch (error) {
      setOutputLog((prev) => [...prev, `Audio Error: ${error.message}`]);
    }
    checkConnection();
  };
  

  const playBuzzerHappyBirthday = async (pin) => {
    console.log(`Playing Happy Birthday on BUZZER on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: Playing Happy Birthday`]);

    const notes = [
      { freq: 261.63, duration: 0.3 }, // C4
      { freq: 261.63, duration: 0.15 }, // C4
      { freq: 293.66, duration: 0.45 }, // D4
      { freq: 261.63, duration: 0.45 }, // C4
      { freq: 349.23, duration: 0.45 }, // F4
      { freq: 329.63, duration: 0.6 }, // E4
    ];

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

      for (const note of notes) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(note.freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);

        oscillator.start();
        await new Promise((resolve) => setTimeout(resolve, note.duration * 1000));
        oscillator.stop();
      }

      const component = findComponentByBridgePin(pin, "buzzer");
      if (component) {
        updateComponentState(component.id, { state: "played_music", song: "Happy Birthday", pin });
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

  const displaySevenSegmentLetter = (letter, pin) => {
    console.log(`Calling displaySevenSegmentLetter(${letter}, "${pin}")`);
    const validLetter = String(letter).toUpperCase().replace(/^"|"$/g, "");
    if (/^[A-FHJKLNPRU]$/.test(validLetter)) {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: Displaying letter ${validLetter}`]);
      const component = findComponentByBridgePin(pin, "sevensegment");
      if (component) {
        updateComponentState(component.id, {
          state: "displaying_letter",
          value: validLetter,
          pin,
        });
      } else {
        setOutputLog((prev) => [
          ...prev,
          `Error: No 7-Segment display found for pin ${pin}`,
        ]);
      }
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: Invalid letter for 7-Segment display on pin ${pin}`,
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

  window.controlSevenSegment = (segments, pin) => {
    console.log(`Calling controlSevenSegment(${JSON.stringify(segments)}, "${pin}")`);
    const component = findComponentByBridgePin(pin, "sevensegment");
    if (component) {
      setOutputLog((prev) => [
        ...prev,
        `7-Segment on pin ${pin}: Segments - a:${segments.a}, b:${segments.b}, c:${segments.c}, d:${segments.d}, e:${segments.e}, f:${segments.f}, g:${segments.g}`,
      ]);
      updateComponentState(component.id, {
        state: "displaying_pattern",
        value: segments,
        pin,
      });
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No 7-Segment display found for pin ${pin}`,
      ]);
    }
    // checkConnection(); // Temporarily disabled
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

  const controlServoPan = (degrees, pin) => {
    console.log(`Calling controlServoPan(${degrees}, "${pin}")`);
    const angle = Math.max(0, Math.min(180, Number(degrees)));
    setOutputLog((prev) => [...prev, `Servo Pan on pin ${pin}: Set to ${angle}°`]);
    const component = findComponentByBridgePin(pin, "pantilt");
    if (component) {
      updateComponentState(component.id, {
        state: "moving",
        angle: { ...component.angle, pan: angle },
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

  const controlServoTilt = (degrees, pin) => {
    console.log(`Calling controlServoTilt(${degrees}, "${pin}")`);
    const angle = Math.max(0, Math.min(180, Number(degrees)));
    setOutputLog((prev) => [...prev, `Servo Tilt on pin ${pin}: Set to ${angle}°`]);
    const component = findComponentByBridgePin(pin, "pantilt");
    if (component) {
      updateComponentState(component.id, {
        state: "moving",
        angle: { ...component.angle, tilt: angle },
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

  const controlServoMode = (degrees, pin) => {
    console.log(`Calling controlServoMode(${degrees}, "${pin}")`);
    const angle = Math.max(0, Math.min(180, Number(degrees)));
    setOutputLog((prev) => [...prev, `Servo Mode on pin ${pin}: Set to ${angle}°`]);
    const component = findComponentByBridgePin(pin, "pantilt");
    if (component) {
      updateComponentState(component.id, {
        state: "mode_set",
        angle: { pan: angle, tilt: angle },
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

  const servoLookUp = (pin) => {
    console.log(`Calling servoLookUp("${pin}")`);
    setOutputLog((prev) => [...prev, `Servo on pin ${pin}: Looking up`]);
    const component = findComponentByBridgePin(pin, "pantilt");
    if (component) {
      updateComponentState(component.id, {
        state: "looking_up",
        angle: { pan: 90, tilt: 0 },
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
    // Map Blockly directions to controlMotor directions
    const mappedDirection = direction.toUpperCase() === "ANTICLOCKWISE" ? "backward" : "forward";
    setOutputLog((prev) => [
      ...prev,
      `DC Motor on pin ${pin}: Speed=${motorSpeed}, Direction=${mappedDirection}`,
    ]);
    const component = findComponentByBridgePin(pin, "motor");
    if (component) {
      updateComponentState(component.id, {
        state: motorSpeed > 0 ? "spinning" : "stopped",
        speed: motorSpeed,
        direction: mappedDirection,
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
 

  const controlMotorDriver = (dir1, dir2, speed1, speed2, pin) => {
    console.log(`Calling controlMotorDriver("${dir1}", "${dir2}", ${speed1}, ${speed2}, "${pin}")`);
    const direction1 = dir1.toUpperCase() === "ANTICLOCKWISE" ? "anticlockwise" : "clockwise";
    const direction2 = dir2.toUpperCase() === "ANTICLOCKWISE" ? "anticlockwise" : "clockwise";
    const speed1Val = Math.max(0, Math.min(255, Number(speed1)));
    const speed2Val = Math.max(0, Math.min(255, Number(speed2)));
    setOutputLog((prev) => [
      ...prev,
      `Motor Driver on pin ${pin}: Dir1=${direction1}, Speed1=${speed1Val}, Dir2=${direction2}, Speed2=${speed2Val}`,
    ]);
    const component = findComponentByBridgePin(pin, "motor");
    if (component) {
      updateComponentState(component.id, {
        state: "running",
        speed: { motor1: speed1Val, motor2: speed2Val },
        direction: { motor1: direction1, motor2: direction2 },
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

  const activateTRI_COLOUR_LED = (pin) => {
    console.log(`Activating TRI_COLOUR_LED on pin ${pin}`);
    setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: Activated`]);
    const component = findComponentByBridgePin(pin, "led");
    if (component) {
      updateComponentState(component.id, { state: "on", pin });
    }
    checkConnection();
  };

  const setLedColor = (color, pin) => {
    console.log(`Calling setLedColor("${color}", "${pin}")`);
  
    const colorMap = {
      red: { r: 255, g: 0, b: 0 },
      green: { r: 0, g: 255, b: 0 },
      blue: { r: 0, g: 0, b: 255 },
      yellow: { r: 255, g: 255, b: 0 },
      cyan: { r: 0, g: 255, b: 255 },
      magenta: { r: 255, g: 0, b: 255 },
      orange: { r: 255, g: 165, b: 0 },
      purple: { r: 128, g: 0, b: 128 },
      pink: { r: 255, g: 192, b: 203 },
      brown: { r: 165, g: 42, b: 42 },
      black: { r: 0, g: 0, b: 0 },
      white: { r: 255, g: 255, b: 255 },
      grey: { r: 128, g: 128, b: 128 },
      lime: { r: 0, g: 255, b: 0 },
      navy: { r: 0, g: 0, b: 128 },
      teal: { r: 0, g: 128, b: 128 },
      maroon: { r: 128, g: 0, b: 0 },
      olive: { r: 128, g: 128, b: 0 },
      skyblue: { r: 135, g: 206, b: 235 },
      aliceblue: { r: 240, g: 248, b: 255 },
      gold: { r: 255, g: 215, b: 0 },
      indigo: { r: 75, g: 0, b: 130 }
    };
  
    const rgb = colorMap[color.toLowerCase()] || { r: 255, g: 255, b: 255 };
  
    setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: Set to ${color}`]);
    const component = findComponentByBridgePin(pin, "led");
    if (component) {
      updateComponentState(component.id, {
        state: "glowing",
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
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
  const setLedColorByRGB = (r, g, b, pin) => {
    console.log(`Setting RGB color to R:${r}, G:${g}, B:${b} on pin ${pin}`);
    const component = findComponentByBridgePin(pin, "led");
    if (component) {
      updateComponentState(component.id, {
        state: "glowing",
        r,
        g,
        b,
        pin,
      });
      setOutputLog((prev) => [
        ...prev,
        `Tri-Color LED on pin ${pin}: Set manually to RGB(${r}, ${g}, ${b})`,
      ]);
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No RGB LED found for pin ${pin}`,
      ]);
    }
    checkConnection();
  };

  window.activateSMARTLIGHT = (pin) => {
    setOutputLog((prev) => [...prev, `Smart Light on pin ${pin}: It displays VIBGYOR colors.`]);
    setComponents((prev) =>
      prev.map((comp) =>
        comp.type === "smartlight" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "vibgyor", pin } : comp
      )
    );
  };

  window.activateSMARTLIGHTCOMPONENT = (pin) => {
    setOutputLog((prev) => [...prev, `SmartLightComponent on pin ${pin}: It is active.`]);
    setComponents((prev) =>
      prev.map((comp) =>
        comp.type === "smartlightcomponent" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "active", pin } : comp
      )
    );
  };

  window.activateSMARTLIGHTLED = (pin) => {
    setOutputLog((prev) => [...prev, `SmartLightLED on pin ${pin}: It is ready to glow.`]);
    setComponents((prev) =>
      prev.map((comp) =>
        comp.type === "smartlightled" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "ready", pin } : comp
      )
    );
  };

  window.smartLightVibgyor = (pin) => {
    setOutputLog((prev) => [...prev, `Smart Light on pin ${pin}: Displaying VIBGYOR colors`]);
    setComponents((prev) =>
      prev.map((comp) =>
        comp.type === "smartlightled" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "vibgyor", pin, on: true } : comp
      )
    );
  };

  window.setSmartLightLedColourSeconds = async (led, colour, seconds, pin) => {
    setOutputLog((prev) => [...prev, `SmartLightLED ${led} on pin ${pin}: Displaying ${colour} for ${seconds} seconds`]);
    setComponents((prev) =>
      prev.map((comp) =>
        comp.type === "smartlightled" && (!comp.pin || comp.pin === pin)
          ? { ...comp, state: "glowing", color: colour, duration: parseFloat(seconds), power: 100, on: true, led }
          : comp
      )
    );
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
    setComponents((prev) =>
      prev.map((comp) =>
        comp.type === "smartlightled" && (!comp.pin || comp.pin === pin) && comp.led === led
          ? { ...comp, state: null, color: null, duration: null, power: null, on: false }
          : comp
      )
    );
    setOutputLog((prev) => [...prev, `SmartLightLED ${led} on pin ${pin}: Turned off after ${seconds} seconds`]);
  };

  window.setSmartLightLedColourPower = (led, colour, power, pin) => {
    setOutputLog((prev) => [...prev, `SmartLightLED ${led} on pin ${pin}: Set to ${colour} at ${power}% power`]);
    setComponents((prev) =>
      prev.map((comp) =>
        comp.type === "smartlightled" && (!comp.pin || comp.pin === pin)
          ? { ...comp, state: "glowing", color: colour, power: parseInt(power), on: true, led }
          : comp
      )
    );
  };

  window.setSmartLightLedDropdownColourPower = (led, colour, power, pin) => {
    setOutputLog((prev) => [...prev, `SmartLightLED ${led} on pin ${pin}: Set to ${colour} with power ${power === "100" ? "ON" : "OFF"}`]);
    setComponents((prev) =>
      prev.map((comp) =>
        comp.type === "smartlightled" && (!comp.pin || comp.pin === pin)
          ? { ...comp, state: power === "100" ? "glowing" : null, color: colour, power: parseInt(power), on: power === "100", led }
          : comp
      )
    );
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
  const startUltrasonicMode = (pin) => {
    console.log(`Calling startUltrasonicMode("${pin}")`);
    setOutputLog((prev) => [...prev, `Ultrasonic Sensor on pin ${pin}: Started continuous mode`]);
    const component = findComponentByBridgePin(pin, "sensor");
    if (component) {
      updateComponentState(component.id, { state: "continuous", pin });
      window.measureDistanceWrapper();
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Error: No Ultrasonic Sensor found for pin ${pin}`,
      ]);
    }
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

  const resetOLED = (pin) => {
    console.log(`Calling resetOLED("${pin}")`);
    setOutputLog((prev) => [...prev, `OLED on pin ${pin}: Reset`]);
    const component = findComponentByBridgePin(pin, "oled");
    if (component) {
      updateComponentState(component.id, {
        state: "reset",
        displayText: "",
        shapes: [],
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

  const displayOLED = (text, pin) => {
    console.log(`Calling displayOLED(${text}, "${pin}")`);
    const displayText = String(text).replace(/^"|"$/g, "");
    setOutputLog((prev) => [...prev, `OLED on pin ${pin}: Displaying ${displayText}`]);
    const component = findComponentByBridgePin(pin, "oled");
    if (component) {
      updateComponentState(component.id, {
        state: "displaying",
        displayText,
        shapes: component.shapes || [],
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

  const drawOLEDCircle = (x, y, radius, pin) => {
    console.log(`Calling drawOLEDCircle(${x}, ${y}, ${radius}, "${pin}")`);
    const xPos = Number(x);
    const yPos = Number(y);
    const rad = Number(radius);
    setOutputLog((prev) => [...prev, `OLED on pin ${pin}: Drawing circle at (${xPos}, ${yPos}), radius ${rad}`]);
    const component = findComponentByBridgePin(pin, "oled");
    if (component) {
      const newShape = { type: "circle", x: xPos, y: yPos, radius: rad, filled: false };
      updateComponentState(component.id, {
        state: "drawing",
        shapes: [...(component.shapes || []), newShape],
        displayText: component.displayText || "",
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

  const drawOLEDPanel = (x1, y1, x2, y2, pin) => {
    console.log(`Calling drawOLEDPanel(${x1}, ${y1}, ${x2}, ${y2}, "${pin}")`);
    const x1Pos = Number(x1);
    const y1Pos = Number(y1);
    const x2Pos = Number(x2);
    const y2Pos = Number(y2);
    setOutputLog((prev) => [...prev, `OLED on pin ${pin}: Drawing panel from (${x1Pos}, ${y1Pos}) to (${x2Pos}, ${y2Pos})`]);
    const component = findComponentByBridgePin(pin, "oled");
    if (component) {
      const newShape = { type: "panel", x1: x1Pos, y1: y1Pos, x2: x2Pos, y2: y2Pos };
      updateComponentState(component.id, {
        state: "drawing",
        shapes: [...(component.shapes || []), newShape],
        displayText: component.displayText || "",
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

  const drawOLEDPixel = (x, y, pin) => {
    console.log(`Calling drawOLEDPixel(${x}, ${y}, "${pin}")`);
    const xPos = Number(x);
    const yPos = Number(y);
    setOutputLog((prev) => [...prev, `OLED on pin ${pin}: Drawing pixel at (${xPos}, ${yPos})`]);
    const component = findComponentByBridgePin(pin, "oled");
    if (component) {
      const newShape = { type: "pixel", x: xPos, y: yPos };
      updateComponentState(component.id, {
        state: "drawing",
        shapes: [...(component.shapes || []), newShape],
        displayText: component.displayText || "",
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

  const drawOLEDRectangle = (x, y, length, breadth, radius, pin) => {
    console.log(`Calling drawOLEDRectangle(${x}, ${y}, ${length}, ${breadth}, ${radius}, "${pin}")`);
    const xPos = Number(x);
    const yPos = Number(y);
    const len = Number(length);
    const bre = Number(breadth);
    const rad = Number(radius);
    setOutputLog((prev) => [...prev, `OLED on pin ${pin}: Drawing rectangle at (${xPos}, ${yPos}), length=${len}, breadth=${bre}, radius=${rad}`]);
    const component = findComponentByBridgePin(pin, "oled");
    if (component) {
      const newShape = { type: "rectangle", x: xPos, y: yPos, length: len, breadth: bre, radius: rad, filled: false };
      updateComponentState(component.id, {
        state: "drawing",
        shapes: [...(component.shapes || []), newShape],
        displayText: component.displayText || "",
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
  const toggleStoreMinimize = () => {
    if (isStoreMinimized) {
      setTabValue(previousTabValue); // Restore previous tab
    } else {
      setPreviousTabValue(tabValue);
      setTabValue(null);
    }
    setIsStoreMinimized(!isStoreMinimized);
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
        direction: type === "motor" ? "clockwise" : null,
        displayText: type === "oled" ? "" : null,
        shapes: type === "oled" ? [] : null,
        xValue: type === "joystick" ? 0 : null,
        yValue: type === "joystick" ? 0 : null,
        r: type === "led" ? 0 : null,
        g: type === "led" ? 0 : null,
        b: type === "led" ? 0 : null,
        r: type === "led" || type === "smartlight" ? 0 : null,
        g: type === "led" || type === "smartlight" ? 0 : null,
        b: type === "led" || type === "smartlight" ? 0 : null,
        duration: type === "smartlight" ? 0 : null,
        power: type === "smartlight" ? 0 : null,
        led: type === "smartlight" ? null : null,
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
        shapes: comp.shapes,
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
        shapes: comp.shapes,
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
      
        // Declare a variable for the ultrasonic sensor reading
        const varName = `distance_${normalizePin(pin)}`;
        return `const ${varName} = activate${device}("${pin}");\n`;
      };
      
    });
    Blockly.Blocks["smartlight_color_duration"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Set Smart Light Color:")
          .appendField(
            new Blockly.FieldDropdown([
              ["Red", "red"],
              ["Green", "green"],
              ["Blue", "blue"],
              ["Yellow", "yellow"],
              ["Cyan", "cyan"],
              ["Magenta", "magenta"],
              ["White", "white"],
            ]),
            "COLOR"
          );
        this.appendValueInput("SECONDS")
          .setCheck("Number")
          .appendField("Duration (s):");
        this.appendDummyInput()
          .appendField("Power:")
          .appendField(
            new Blockly.FieldDropdown([["ON", "ON"], ["OFF", "OFF"]]),
            "POWER"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Sets the Smart Light to a color for a duration with power state");
      },
    };
    javascriptGenerator["smartlight_color_duration"] = function (block) {
      const color = block.getFieldValue("COLOR");
      const seconds =
        javascriptGenerator.valueToCode(
          block,
          "SECONDS",
          javascriptGenerator.ORDER_ATOMIC
        ) || "1";
      const power = block.getFieldValue("POWER");
      const pin = "C01";
      return `await setSmartLightColor("${color}", ${seconds}, "${power}", "${pin}");\n`;
    };

    Blockly.Blocks["smartlight_led_control"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Set Smart Light LED:")
          .appendField(
            new Blockly.FieldDropdown([
              ["LED1", "LED1"],
              ["LED2", "LED2"],
              ["LED3", "LED3"],
            ]),
            "LED"
          );
        this.appendDummyInput()
          .appendField("Color:")
          .appendField(
            new Blockly.FieldDropdown([
              ["Red", "red"],
              ["Green", "green"],
              ["Blue", "blue"],
              ["Yellow", "yellow"],
              ["Cyan", "cyan"],
              ["Magenta", "magenta"],
              ["White", "white"],
            ]),
            "COLOR"
          );
        this.appendDummyInput()
          .appendField("Power:")
          .appendField(
            new Blockly.FieldDropdown([["ON", "ON"], ["OFF", "OFF"]]),
            "POWER"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Controls a specific Smart Light LED with color and power state");
      },
    };
    javascriptGenerator["smartlight_led_control"] = function (block) {
      const led = block.getFieldValue("LED");
      const color = block.getFieldValue("COLOR");
      const power = block.getFieldValue("POWER");
      const pin = "C01";
      return `setSmartLightLed("${led}", "${color}", "${power}", "${pin}");\n`;
    };

    Blockly.Blocks["sevensegment_display"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Display Number on 7-Segment")
          .appendField(
            new Blockly.FieldDropdown([
              ["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"],
              ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"]
            ]),
            "NUMBER"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Displays a number (0-9) on the 7-segment display");
      }
    };
    
    javascriptGenerator["sevensegment_display"] = function (block) {
      const number = block.getFieldValue("NUMBER");
      const pin = "C03";
      return `displaySevenSegment(${number}, "${pin}");\n`;
    };
    
    Blockly.Blocks["sevensegment_manual"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("7-Segment Display")
          
        this.appendDummyInput()
          .appendField("Segment a:")
          .appendField(new Blockly.FieldDropdown([["ON", "TRUE"], ["OFF", "FALSE"]]), "SEG_A");
        this.appendDummyInput()
          .appendField("Segment b:")
          .appendField(new Blockly.FieldDropdown([["ON", "TRUE"], ["OFF", "FALSE"]]), "SEG_B");
        this.appendDummyInput()
          .appendField("Segment c:")
          .appendField(new Blockly.FieldDropdown([["ON", "TRUE"], ["OFF", "FALSE"]]), "SEG_C");
        this.appendDummyInput()
          .appendField("Segment d:")
          .appendField(new Blockly.FieldDropdown([["ON", "TRUE"], ["OFF", "FALSE"]]), "SEG_D");
        this.appendDummyInput()
          .appendField("Segment e:")
          .appendField(new Blockly.FieldDropdown([["ON", "TRUE"], ["OFF", "FALSE"]]), "SEG_E");
        this.appendDummyInput()
          .appendField("Segment f:")
          .appendField(new Blockly.FieldDropdown([["ON", "TRUE"], ["OFF", "FALSE"]]), "SEG_F");
        this.appendDummyInput()
          .appendField("Segment g:")
          .appendField(new Blockly.FieldDropdown([["ON", "TRUE"], ["OFF", "FALSE"]]), "SEG_G");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Control individual segments (a-g) of a 7-segment display with ON/OFF options");
      },
    };
    
    javascriptGenerator["sevensegment_manual"] = function (block) {
      const pin = block.getFieldValue("PIN") || "C03";
      const segA = block.getFieldValue("SEG_A") === "TRUE";
      const segB = block.getFieldValue("SEG_B") === "TRUE";
      const segC = block.getFieldValue("SEG_C") === "TRUE";
      const segD = block.getFieldValue("SEG_D") === "TRUE";
      const segE = block.getFieldValue("SEG_E") === "TRUE";
      const segF = block.getFieldValue("SEG_F") === "TRUE";
      const segG = block.getFieldValue("SEG_G") === "TRUE";
      const segments = { a: segA, b: segB, c: segC, d: segD, e: segE, f: segF, g: segG };
      return `controlSevenSegment(${JSON.stringify(segments)}, "${pin}");\n`;
    };
   
    
    Blockly.Blocks["sevensegment_letter"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Display Letter on 7-Segment")
          .appendField(
            new Blockly.FieldDropdown([
              ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"],
              ["H", "H"], ["J", "J"], ["K", "K"], ["L", "L"], ["N", "N"], ["P", "P"],
              ["R", "R"], ["U", "U"]
            ]),
            "LETTER"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Displays a letter (A-F, H, J, K, L, N, P, R, U) on the 7-segment display");
      }
    };
    
    javascriptGenerator["sevensegment_letter"] = function (block) {
      const letter = block.getFieldValue("LETTER");
      const pin = "C03";
      return `displaySevenSegmentLetter("${letter}", "${pin}");\n`;
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

    Blockly.Blocks["servo_pan"] = {
      init: function () {
        this.appendValueInput("DEGREES")
          .setCheck("Number")
          .appendField("Servo Pan Angle:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Sets the servo pan angle (0-180 degrees)");
      },
    };
    javascriptGenerator["servo_pan"] = function (block) {
      const degrees =
        javascriptGenerator.valueToCode(
          block,
          "DEGREES",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C09";
      return `controlServoPan(${degrees}, "${pin}");\n`;
    };

    Blockly.Blocks["servo_tilt"] = {
      init: function () {
        this.appendValueInput("DEGREES")
          .setCheck("Number")
          .appendField("Servo Tilt Angle:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Sets the servo tilt angle (0-180 degrees)");
      },
    };
    javascriptGenerator["servo_tilt"] = function (block) {
      const degrees =
        javascriptGenerator.valueToCode(
          block,
          "DEGREES",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C09";
      return `controlServoTilt(${degrees}, "${pin}");\n`;
    };

    Blockly.Blocks["servo_mode"] = {
      init: function () {
        this.appendValueInput("DEGREES")
          .setCheck("Number")
          .appendField("Servo Mode Angle:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Sets both servo angles to the same value (0-180 degrees)");
      },
    };
    javascriptGenerator["servo_mode"] = function (block) {
      const degrees =
        javascriptGenerator.valueToCode(
          block,
          "DEGREES",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C09";
      return `controlServoMode(${degrees}, "${pin}");\n`;
    };

    Blockly.Blocks["servo_lookup"] = {
      init: function () {
        this.appendDummyInput().appendField("Servo Look Up");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Sets servo to look up position");
      },
    };
    javascriptGenerator["servo_lookup"] = function () {
      const pin = "C09";
      return `servoLookUp("${pin}");\n`;
    };

    Blockly.Blocks["motor_control"] = {
      init: function () {
        this.appendValueInput("SPEED")
          .setCheck("Number")
          .appendField("Control Motor - Speed:");
        this.appendDummyInput()
          .appendField("Direction:")
          .appendField(
            new Blockly.FieldDropdown([
              ["Clockwise", "CLOCKWISE"],
              ["Anticlockwise", "ANTICLOCKWISE"],
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
      const direction = block.getFieldValue("DIRECTION") || "CLOCKWISE";
      const pin = "C06";
      return `controlMotor(${speed}, "${direction}", "${pin}");\n`;
    };

    Blockly.Blocks["motor_driver"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Motor Driver - Dir1:")
          .appendField(
            new Blockly.FieldDropdown([
              ["Clockwise", "CLOCKWISE"],
              ["Anticlockwise", "ANTICLOCKWISE"],
            ]),
            "DIR1"
          );
                this.appendValueInput("SPEED1")
          .setCheck("Number")
          .appendField("Speed1:");
        this.appendDummyInput()
          .appendField("Dir2:")
          .appendField(
            new Blockly.FieldDropdown([
              ["Clockwise", "CLOCKWISE"],
              ["Anticlockwise", "ANTICLOCKWISE"],
            ]),
            "DIR2"
          );
        this.appendValueInput("SPEED2")
          .setCheck("Number")
          .appendField("Speed2:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Controls two motors with directions and speeds (0-255)");
      },
    };
    javascriptGenerator["motor_driver"] = function (block) {
      const dir1 = block.getFieldValue("DIR1") || "CLOCKWISE";
      const speed1 =
        javascriptGenerator.valueToCode(
          block,
          "SPEED1",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const dir2 = block.getFieldValue("DIR2") || "CLOCKWISE";
      const speed2 =
        javascriptGenerator.valueToCode(
          block,
          "SPEED2",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C06";
      return `controlMotorDriver("${dir1}", "${dir2}", ${speed1}, ${speed2}, "${pin}");\n`;
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

    Blockly.Blocks["buzzer_song_selector"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Play Song on Buzzer")
          .appendField(
            new Blockly.FieldDropdown([
              ["Happy Birthday", "happy_birthday"],
              ["Sare Gama Pa", "sare_gama_pa"]
            ]),
            "SONG"
          );
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Plays a selected tune on the buzzer.");
      },
    };
    javascriptGenerator["buzzer_song_selector"] = function (block) {
      const song = block.getFieldValue("SONG"); // Get the selected song
      const pin = "C01"; // Fixed pin
    
      // Return the appropriate function based on the selected song
      if (song === "happy_birthday") {
        return `await playBuzzerHappyBirthday("${pin}");\n`;
      } else if (song === "sare_gama_pa") {
        return `await playBuzzerSareGamaPa("${pin}");\n`;
      }
    };
        

    
    
    Blockly.Blocks["led_manual_rgb"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Set RGB LED")
          .appendField("Red")
          .appendField(new Blockly.FieldNumber(0, 0, 255), "RED")
          .appendField("Green")
          .appendField(new Blockly.FieldNumber(0, 0, 255), "GREEN")
          .appendField("Blue")
          .appendField(new Blockly.FieldNumber(0, 0, 255), "BLUE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
        this.setTooltip("Set RGB LED intensity values for Red, Green, and Blue. Pin is fixed to C011.");
      }
    };
    
    javascriptGenerator["led_manual_rgb"] = function (block) {
      const red = block.getFieldValue("RED") || 0;
      const green = block.getFieldValue("GREEN") || 0;
      const blue = block.getFieldValue("BLUE") || 0;
      const pin = "C011"; // Fixed pin
    
      return `setLedRGB(${red}, ${green}, ${blue}, "${pin}");\n`;
    };
    
        
    

   // BLOCK: Set predefined named color
Blockly.Blocks["led_color"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Set LED Color:")
      .appendField(
        new Blockly.FieldDropdown([
          ["Red", "red"],
          ["Green", "green"],
          ["Blue", "blue"],
          ["Yellow", "yellow"],
          ["Cyan", "cyan"],
          ["Magenta", "magenta"],
          ["Orange", "orange"],
          ["Purple", "purple"],
          ["Pink", "pink"],
          ["Brown", "brown"],
          ["Black", "black"],
          ["White", "white"],
          ["Grey", "grey"],
          ["Lime", "lime"],
          ["Navy", "navy"],
          ["Teal", "teal"],
          ["Maroon", "maroon"],
          ["Olive", "olive"],
          ["SkyBlue", "skyblue"],
          ["AliceBlue", "aliceblue"],
          ["Gold", "gold"],
          ["Indigo", "indigo"]
        ]),
        "COLOR"
      );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Sets the LED to a predefined color");
  },
};

javascriptGenerator["led_color"] = function (block) {
  const color = block.getFieldValue("COLOR");
  const pin = "C011";
  return `setLedColor("${color}", "${pin}");\n`;
};

// BLOCK: Set RGB LED with intensity using hex picker
Blockly.Blocks["led_rgb_intensity"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("Set RGB LED Color:")
      .appendField(new Blockly.FieldColour("#ff0000"), "COLOR");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(180);
    this.setTooltip("Pick a color to set the RGB LED.");
  },
};

javascriptGenerator["led_rgb_intensity"] = function (block) {
  const color = block.getFieldValue("COLOR"); // e.g., "#ff0000"
  const red = parseInt(color.substring(1, 3), 16);
  const green = parseInt(color.substring(3, 5), 16);
  const blue = parseInt(color.substring(5, 7), 16);
  const pin = "C011";
  return `setLedRGB(${red}, ${green}, ${blue}, "${pin}");\n`;
};



    Blockly.Blocks["oled_display"] = {
      init: function () {
        this.appendValueInput("TEXT")
          .setCheck("String")
          .appendField("Display Text on OLED");
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

    Blockly.Blocks["oled_reset"] = {
      init: function () {
        this.appendDummyInput().appendField("Reset OLED");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Clears the OLED display");
      },
    };
    javascriptGenerator["oled_reset"] = function () {
      const pin = "C01";
      return `resetOLED("${pin}");\n`;
    };

    Blockly.Blocks["oled_circle"] = {
      init: function () {
        this.appendValueInput("X")
          .setCheck("Number")
          .appendField("Draw OLED Circle - X:");
        this.appendValueInput("Y")
          .setCheck("Number")
          .appendField("Y:");
        this.appendValueInput("RADIUS")
          .setCheck("Number")
          .appendField("Radius:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Draws a non-filled circle on the OLED");
      },
    };
    javascriptGenerator["oled_circle"] = function (block) {
      const x =
        javascriptGenerator.valueToCode(
          block,
          "X",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const y =
        javascriptGenerator.valueToCode(
          block,
          "Y",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const radius =
        javascriptGenerator.valueToCode(
          block,
          "RADIUS",
          javascriptGenerator.ORDER_ATOMIC
        ) || "10";
      const pin = "C01";
      return `drawOLEDCircle(${x}, ${y}, ${radius}, "${pin}");\n`;
    };

    Blockly.Blocks["oled_panel"] = {
      init: function () {
        this.appendValueInput("X1")
          .setCheck("Number")
          .appendField("Draw OLED Panel - X1:");
        this.appendValueInput("Y1")
          .setCheck("Number")
          .appendField("Y1:");
        this.appendValueInput("X2")
          .setCheck("Number")
          .appendField("X2:");
        this.appendValueInput("Y2")
          .setCheck("Number")
          .appendField("Y2:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Draws a panel (line) on the OLED");
      },
    };
    javascriptGenerator["oled_panel"] = function (block) {
      const x1 =
        javascriptGenerator.valueToCode(
          block,
          "X1",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const y1 =
        javascriptGenerator.valueToCode(
          block,
          "Y1",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const x2 =
        javascriptGenerator.valueToCode(
          block,
          "X2",
          javascriptGenerator.ORDER_ATOMIC
        ) || "10";
      const y2 =
        javascriptGenerator.valueToCode(
          block,
          "Y2",
          javascriptGenerator.ORDER_ATOMIC
        ) || "10";
      const pin = "C01";
      return `drawOLEDPanel(${x1}, ${y1}, ${x2}, ${y2}, "${pin}");\n`;
    };

    Blockly.Blocks["oled_pixel"] = {
      init: function () {
        this.appendValueInput("X")
          .setCheck("Number")
          .appendField("Draw OLED Pixel - X:");
        this.appendValueInput("Y")
          .setCheck("Number")
          .appendField("Y:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Draws a single pixel on the OLED");
      },
    };
    javascriptGenerator["oled_pixel"] = function (block) {
      const x =
        javascriptGenerator.valueToCode(
          block,
          "X",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const y =
        javascriptGenerator.valueToCode(
          block,
          "Y",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C01";
      return `drawOLEDPixel(${x}, ${y}, "${pin}");\n`;
    };

    Blockly.Blocks["oled_rectangle"] = {
      init: function () {
        this.appendValueInput("X")
          .setCheck("Number")
          .appendField("Draw OLED Rectangle - X:");
        this.appendValueInput("Y")
          .setCheck("Number")
          .appendField("Y:");
        this.appendValueInput("LENGTH")
          .setCheck("Number")
          .appendField("Length:");
        this.appendValueInput("BREADTH")
          .setCheck("Number")
          .appendField("Breadth:");
        this.appendValueInput("RADIUS")
          .setCheck("Number")
          .appendField("Radius:");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Draws a non-filled rectangle with rounded corners on the OLED");
      },
    };
    javascriptGenerator["oled_rectangle"] = function (block) {
      const x =
        javascriptGenerator.valueToCode(
          block,
          "X",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const y =
        javascriptGenerator.valueToCode(
          block,
          "Y",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const length =
        javascriptGenerator.valueToCode(
          block,
          "LENGTH",
          javascriptGenerator.ORDER_ATOMIC
        ) || "10";
      const breadth =
        javascriptGenerator.valueToCode(
          block,
          "BREADTH",
          javascriptGenerator.ORDER_ATOMIC
        ) || "10";
      const radius =
        javascriptGenerator.valueToCode(
          block,
          "RADIUS",
          javascriptGenerator.ORDER_ATOMIC
        ) || "0";
      const pin = "C01";
      return `drawOLEDRectangle(${x}, ${y}, ${length}, ${breadth}, ${radius}, "${pin}");\n`;
    };

    Blockly.Blocks["ultrasonic_mode"] = {
      init: function () {
        this.appendDummyInput().appendField("Start Ultrasonic Continuous Mode");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Starts continuous distance measurement");
      },
    };
    javascriptGenerator["ultrasonic_mode"] = function () {
      const pin = "C12";
      return `startUltrasonicMode("${pin}");\n`;
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
      return `alert("Total distance is " + ${message});\n`;
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
          name: "Seven Segment Display",
          colour: "#0288d1",
          contents: [
            { kind: "block", type: "sevensegment" },
            { kind: "block", type: "sevensegment_display" },
            { kind: "block", type: "sevensegment_letter" },
            { kind: "block", type: "sevensegment_manual" },
            
            // { kind: "block", type: "oled" },
            // { kind: "block", type: "oled_display" },
            // { kind: "block", type: "oled_reset" },
            // { kind: "block", type: "oled_circle" },
            // { kind: "block", type: "oled_panel" },
            // { kind: "block", type: "oled_pixel" },
            // { kind: "block", type: "oled_rectangle" },
          ],
        },
        {
          kind: "category",
          name: "OLED Display",
          colour: "#0288d1",
          contents: [
            // { kind: "block", type: "sevensegment" },
            // { kind: "block", type: "sevensegment_display" },
            // { kind: "block", type: "sevensegment_letter" },
            // { kind: "block", type: "sevensegment_manual" },
            
            { kind: "block", type: "oled" },
            { kind: "block", type: "oled_display" },
            { kind: "block", type: "oled_reset" },
            { kind: "block", type: "oled_circle" },
            { kind: "block", type: "oled_panel" },
            { kind: "block", type: "oled_pixel" },
            { kind: "block", type: "oled_rectangle" },
          ],
        },
        {
          kind: "category",
          name: "Motor",
          colour: "#5CA699",
          contents: [
            { kind: "block", type: "motor" },
            { kind: "block", type: "motor_control" },
            { kind: "block", type: "motor_driver" },
            // { kind: "block", type: "pantilt" },
            // { kind: "block", type: "pantilt_control" },
            // { kind: "block", type: "servo_pan" },
            // { kind: "block", type: "servo_tilt" },
            // { kind: "block", type: "servo_mode" },
            // { kind: "block", type: "servo_lookup" },
          ],
        },
        {
          kind: "category",
          name: "Pan and Tilt",
          colour: "#5CA699",
          contents: [
            // { kind: "block", type: "motor" },
            // { kind: "block", type: "motor_control" },
            // { kind: "block", type: "motor_driver" },
            { kind: "block", type: "pantilt" },
            { kind: "block", type: "pantilt_control" },
            { kind: "block", type: "servo_pan" },
            { kind: "block", type: "servo_tilt" },
            { kind: "block", type: "servo_mode" },
            { kind: "block", type: "servo_lookup" },
          ],
        },
        {
          kind: "category",
          name: "Sound",
          colour: "#A65C81",
          contents: [
            { kind: "block", type: "buzzer" },
            { kind: "block", type: "buzzer_frequency" },
            { kind: "block", type: "buzzer_song_selector" },
          ],
        },
        // {
        //   kind: "category",
        //   name: "Sensor",
        //   colour: "#5C81A6",
        //   contents: [
        //     { kind: "block", type: "sensor" },
        //     { kind: "block", type: "ultrasonic_mode" },
        //   ],
        // },
        {
          kind: "category",
          name: "Tri colour LED",
          colour: "#A6915C",
          contents: [
            { kind: "block", type: "led" },
            { kind: "block", type: "led_rgb_intensity" },
            { kind: "block", type: "led_color" },
            { kind: "block", type: "led_manual_rgb" },
            
            // { kind: "block", type: "smartlight_vibgyor" },
            // { kind: "block", type: "smartlightled_colour_seconds" },
            // { kind: "block", type: "smartlightled_colour_power" },
            // { kind: "block", type: "smartlightled_dropdown_colour_power" },
           
          ],
        },
        {
          kind: "category",
          name: "Smart Light led",
          colour: "#A6915C",
          contents: [
            // { kind: "block", type: "led" },
            // { kind: "block", type: "led_rgb_intensity" },
            // { kind: "block", type: "led_color" },
            // { kind: "block", type: "led_manual_rgb" },
            
            { kind: "block", type: "smartlight_vibgyor" },
            { kind: "block", type: "smartlightled_colour_seconds" },
            { kind: "block", type: "smartlightled_colour_power" },
            { kind: "block", type: "smartlightled_dropdown_colour_power" },
           
          ],
        },
        {
          kind: "category",
          name: "Joystick",
          colour: "#5CA65C",
          contents: [{ kind: "block", type: "joystick" }],
        },
        {
          kind: "category",
          name: "Other",
          colour: "#A65C5C",
          contents: [{ kind: "block", type: "object" }],
        },
      ],
    };

    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      toolbox: toolbox,
      scrollbars: true,
      trashcan: true,
      sounds: true,
      media: "https://unpkg.com/blockly@latest/media/",
      zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3 },
      grid: { spacing: 20, length: 3, colour: "#ccc", snap: true },
    });

    workspaceRef.current.addChangeListener(() => {
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      setGeneratedCode(code);
    });

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  const runCode = async () => {
    setOutputLog([]);
    const code = generatedCode;
    console.log("Generated Code:\n", code);

    const context = {
      alert,
      activateBUZZER,
      playBuzzerFrequency,
      playBuzzerHappyBirthday,
      activateSEVENSEGMENT,
      displaySevenSegment,
      displaySevenSegmentLetter,
      activateSOIL_SENSOR,
      activateDIP_SWITCH,
      activatePAN_AND_TILT,
      controlPanTilt,
      controlServoPan,
      controlServoTilt,
      controlServoMode,
      servoLookUp,
      activateDC_MOTOR,
      controlMotor,
      controlMotorDriver,
      activateTRI_COLOUR_LED,
      setLedRGB,
      setLedColor,
      activateULTRASONIC_SENSOR,
      startUltrasonicMode,
      activateOLED,
      resetOLED,
      displayOLED,
      drawOLEDCircle,
      drawOLEDPanel,
      drawOLEDPixel,
      drawOLEDRectangle,
      activateJOYSTICK,
      activateOBJECT,
    };

    try {
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

  const testSevenSegmentLetter = () => {
    displaySevenSegmentLetter("A", "C03");
  };

  const testOLED = () => {
    displayOLED("Test", "C01");
  };

  const testOLEDCircle = () => {
    drawOLEDCircle(64, 32, 20, "C01");
  };

  const testOLEDPanel = () => {
    drawOLEDPanel(10, 10, 100, 50, "C01");
  };

  const testOLEDPixel = () => {
    drawOLEDPixel(64, 32, "C01");
  };

  const testOLEDRectangle = () => {
    drawOLEDRectangle(20, 20, 80, 40, 5, "C01");
  };

  const testPanTilt = () => {
    controlPanTilt(90, 45, "C09");
  };

  const testServoPan = () => {
    controlServoPan(90, "C09");
  };

  const testServoTilt = () => {
    controlServoTilt(45, "C09");
  };

  const testLED = () => {
    setLedRGB(255, 0, 0, "C011");
  };

  const testLEDColor = () => {
    setLedColor("aliceblue", "C011");
  };

  const testMotor = () => {
    controlMotor(255, "FORWARD", "C06");
  };

  const testMotorDriver = () => {
    controlMotorDriver("FORWARD", "BACKWARD", 200, 200, "C06");
  };

  const testBuzzer = () => {
    playBuzzerFrequency(440, 1, "C01");
  };

  const testBuzzerHappyBirthday = () => {
    playBuzzerHappyBirthday("C01");
  };

  const testJoystick = () => {
    activateJOYSTICK("C10");
  };

  const testUltrasonic = () => {
    startUltrasonicMode("C12");
  };


  console.log('Theme:', theme); // Debug theme

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DndProvider backend={HTML5Backend}>
          <Box
            sx={{
              minHeight: '100vh',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            }}
          >
            <AppBar
              position="static"
              sx={{
                background: 'linear-gradient(to right, #0288d1, #4fc3f7)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              <Toolbar>
                <Typography
                  variant="h5"
                  sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}
                >
                  Sheshgyan Simulator
                </Typography>
                <Button
                  color="inherit"
                  onClick={runCode}
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
                    px: 2,
                  }}
                >
                  Run Code
                </Button>
              </Toolbar>
            </AppBar>

            <Container maxWidth="xxl" sx={{ mt: 4, mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 3, height: '80vh' }}>
                <Box
                  sx={{
                    width: isMinimizedBlockly ? '10%' : isMinimizedWorkspace ? '90%' : '50%',
                    bgcolor: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    p: isMinimizedBlockly ? 1 : 3,
                    overflow: 'hidden',
                    transition: 'width 0.3s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isMinimizedBlockly ? 0 : 2 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.primary?.main || '#0288d1', fontWeight: 600 }}>
                      Blockly Editor
                    </Typography>
                    <IconButton
                      onClick={() => setIsMinimizedBlockly(!isMinimizedBlockly)}
                      sx={{ color: theme.palette.primary?.main || '#0288d1' }}
                    >
                      {isMinimizedBlockly ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                    </IconButton>
                  </Box>
                  {!isMinimizedBlockly && (
                    <div
                      ref={blocklyDiv}
                      style={{
                        flex: 1,
                        width: '200%',
                        borderRadius: 8,
                        overflow: 'hidden',
                        backgroundColor: '#f9fafb',
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ width: isMinimizedWorkspace ? '10%' : isMinimizedBlockly ? '90%' : '50%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      p: isStoreMinimized ? 1 : tabValue === null ? 2 : 3,
                      flex: isStoreMinimized ? '0 0 48px' : tabValue === null ? '0 0 80px' : '0 0 40%',
                      overflowY: 'auto',
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isStoreMinimized ? 0 : 0.5 }}>
                      
                      <IconButton
                        onClick={toggleStoreMinimize}
                        sx={{
                          color: theme.palette.primary?.main || '#0288d1',
                          bgcolor: isStoreMinimized ? 'rgba(2,136,209,0.05)' : 'transparent',
                        }}
                      >
                        {isStoreMinimized ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                      </IconButton>
                    </Box>
                    {!isStoreMinimized && (
                      <>
                        <Tabs
                          value={tabValue}
                          onChange={handleTabChange}
                          
                         
                          sx={{ mb: tabValue === null ? 0 : 2 }}
                        >
                          <Tab label="Bridge" />
                          <Tab label="LEDs" />
                          <Tab label="Display" />
                          {/* <Tab label="Sensors" /> */}
                          <Tab label="Sound" />
                          <Tab label="Motor Driver" />
                          <Tab label="Joystick" />
                          <Tab label="Other" />
                        </Tabs>
                        {tabValue !== null && (
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
                        )}
                      </>
                    )}
                  </Box>

                  <Box
                    sx={{
                      bgcolor: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      p: isMinimizedWorkspace ? 1 : 3,
                      flex: 1,
                      transition: 'all 0.3s ease-in-out',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isMinimizedWorkspace ? 0 : 2 }}>
                      <Typography variant="h6" sx={{ color: theme.palette.primary?.main || '#0288d1', fontWeight: 600 }}>
                        Workspace
                      </Typography>
                      <IconButton
                        onClick={() => setIsMinimizedWorkspace(!isMinimizedWorkspace)}
                        sx={{ color: theme.palette.primary?.main || '#0288d1' }}
                      >
                        {isMinimizedWorkspace ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                      </IconButton>
                    </Box>
                    {!isMinimizedWorkspace && (
                      <Workspace
                        components={components}
                        setComponents={setComponents}
                        wires={wires}
                        setWires={setWires}
                        addWire={addWire}
                        sx={{ flex: 1 }}
                      />
                    )}
                  </Box>
                </Box>
              </Box>

              <Dialog
                open={openSessionsDialog}
                onClose={() => setOpenSessionsDialog(false)}
                PaperProps={{ sx: { borderRadius: 12 } }}
              >
                <DialogTitle sx={{ fontWeight: 600, color: theme.palette.primary?.main || '#0288d1' }}>
                  Load Session
                </DialogTitle>
                <DialogContent>
                  <List>
                    {sessions.map((session) => (
                      <ListItem
                        button
                        key={session.id}
                        onClick={() => loadSession(session.id)}
                        sx={{
                          borderRadius: 8,
                          '&:hover': { bgcolor: 'rgba(2,136,209,0.05)' },
                        }}
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
                <Alert
                  severity="success"
                  onClose={() => setSnackbarOpen(false)}
                  sx={{ borderRadius: 8, bgcolor: '#e3f2fd', color: '#0288d1' }}
                >
                  Action completed successfully!
                </Alert>
              </Snackbar>

              <Box
                sx={{
                  mt: 4,
                  bgcolor: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  p: 3,
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary?.main || '#0288d1', fontWeight: 600 }}>
                  Output Log
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', bgcolor: '#f9fafb', p: 2, borderRadius: 8 }}>
                  {outputLog.map((log, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1, color: '#374151' }}>
                      {log}
                    </Typography>
                  ))}
                </Box>
              </Box>
            </Container>
          </Box>
        </DndProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default IoTSimulator;
