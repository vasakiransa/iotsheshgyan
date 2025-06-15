
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
  Paper,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MinimizeIcon from "@mui/icons-material/Minimize";
import MaximizeIcon from "@mui/icons-material/Maximize";
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
import smartLightComponentImage from "./assets/smartlight.jpeg"; // New image for SmartLightComponent
import smartLightLedImage from "./assets/smart.png"; // New image for SmartLightLED
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
          background: "linear-gradient(to right, #0288d1, #4fc3f7)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease-in-out",
          "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.15)" },
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
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);

  const esp32Pins = [
    "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12"
  ];

  const pinDeviceMap = {
    "C01": { device: "BUZZER", description: "The buzzer will turn on, and I need sound." },
    "C02": { device: "SEVENSEGMENT", description: "It is showing the number." },
    "C03": { device: "SOIL_SENSOR", description: "It is reading soil data." },
    "C04": { device: "DIP_SWITCH", description: "It is toggled." },
    "C05": { device: "PAN_AND_TILT", description: "The servo will rotate." },
    "C06": { device: "WEATHER_MONITORING", description: "It senses temperature and humidity." },
    "C07": { device: "TRI_COLOUR_LED", description: "The LED will glow." },
    "C08": { device: "ULTRASONIC_SENSOR", description: "It senses the obstacle." },
    "C09": { device: "OLED", description: "It is showing the picture and number." },
    "C10": { device: "DC_MOTOR", description: "The motor will rotate." },
    "C11": { device: "JOYSTICK", description: "It is showing the X-axis and Y-axis values." },
    "C12": { device: "SMARTLIGHT", description: "It displays VIBGYOR colors." },
  };

  const componentsList = [
    { id: 1, name: "IoT Bridge", type: "bridge", image: bridgeImage },
    { id: 2, name: "RGB LED", type: "led", image: ledImage },
    { id: 3, name: "Temp Sensor", type: "sensor", image: sensorImage },
    { id: 4, name: "DC Motor", type: "motor", image: motorImage },
    { id: 5, name: "Buzzer", type: "buzzer", image: buzzerImage },
    { id: 6, name: "Joystick", type: "joystick", image: joystickImage },
    { id: 7, name: "Smart LED", type: "smartlight", image: smartLightImage },
    { id: 8, name: "7-Segment", type: "sevensegment", image: sevenSegmentImage },
    { id: 9, name: "Pan & Tilt", type: "pantilt", image: panTiltImage },
    { id: 10, name: "Audio", type: "audioplayer", image: audioplayerImage },
    { id: 11, name: "OLED", type: "oled", image: oledImage },
    { id: 12, name: "LDR", type: "ldr", image: ldrImage },
    { id: 13, name: "Object", type: "object", image: objectImage },
    { id: 14, name: "SmartLightComponent", type: "smartlightcomponent", image: smartLightComponentImage },
    { id: 15, name: "SmartLightLED", type: "smartlightled", image: smartLightLedImage },
  ];

  const handleAddComponent = (id, name, type, image) => {
    setComponents((prev) => [
      ...prev,
      { id: `${id}-${Date.now()}`, name, type, image, x: 100, y: 100, pin: null, connectedTo: null, state: null, color: null, power: null, duration: null },
    ]);
  };

  const checkConnection = () => {
    // Check RGB LED connection (IoT Bridge C11 to RGB LED C011)
    const bridge = components.find(comp => comp.type === "bridge");
    const led = components.find(comp => comp.type === "led");

    const rgbConnection = wires.find(
      wire =>
        (wire.sourceId === bridge?.id && wire.sourcePin === "C11" && wire.targetId === led?.id && wire.targetPin === "C011") ||
        (wire.sourceId === led?.id && wire.sourcePin === "C011" && wire.targetId === bridge?.id && wire.targetPin === "C11")
    );

    if (bridge && led && rgbConnection) {
      setComponents(prev =>
        prev.map(comp => {
          if (comp.type === "led" && comp.id === led.id) {
            return { ...comp, state: "glowing", color: "red", on: true };
          }
          return comp;
        })
      );
      setOutputLog(prev => [...prev, "RGB LED on C011 is glowing red due to connection with IoT Bridge C11"]);
    } else {
      setComponents(prev =>
        prev.map(comp => {
          if (comp.type === "led" && comp.id === led?.id) {
            return { ...comp, state: null, color: null, on: false };
          }
          return comp;
        })
      );
      setOutputLog(prev => [...prev, "No valid connection between IoT Bridge C11 and RGB LED C011"]);
    }

    // Check SmartLight chain (Bridge -> SmartLightComponent1 -> SmartLightComponent2 -> SmartLightLED)
    const smartLightComp1 = components.find(comp => comp.type === "smartlightcomponent");
    const smartLightComp2 = components.find(comp => comp.type === "smartlightcomponent" && comp.id !== smartLightComp1?.id);
    const smartLightLed = components.find(comp => comp.type === "smartlightled");

    const connection1 = wires.find(
      wire =>
        (wire.sourceId === bridge?.id && wire.sourcePin === "C12" && wire.targetId === smartLightComp1?.id && wire.targetPin === "IN") ||
        (wire.sourceId === smartLightComp1?.id && wire.sourcePin === "IN" && wire.targetId === bridge?.id && wire.targetPin === "C12")
    );

    const connection2 = wires.find(
      wire =>
        (wire.sourceId === smartLightComp1?.id && wire.sourcePin === "OUT" && wire.targetId === smartLightComp2?.id && wire.targetPin === "IN") ||
        (wire.sourceId === smartLightComp2?.id && wire.sourcePin === "IN" && wire.targetId === smartLightComp1?.id && wire.targetPin === "OUT")
    );

    const connection3 = wires.find(
      wire =>
        (wire.sourceId === smartLightComp2?.id && wire.sourcePin === "OUT" && wire.targetId === smartLightLed?.id && wire.targetPin === "C01") ||
        (wire.sourceId === smartLightLed?.id && wire.sourcePin === "C01" && wire.targetId === smartLightComp2?.id && wire.targetPin === "OUT")
    );

    if (bridge && smartLightComp1 && smartLightComp2 && smartLightLed && connection1 && connection2 && connection3) {
      setComponents(prev =>
        prev.map(comp => {
          if (comp.type === "smartlightled" && comp.id === smartLightLed.id) {
            return { ...comp, state: "glowing", color: comp.color || "white", power: comp.power || 100, on: true };
          }
          return comp;
        })
      );
      setOutputLog(prev => [...prev, `SmartLightLED on C01 is glowing ${smartLightLed.color || "white"} due to connection chain`]);
    } else {
      setComponents(prev =>
        prev.map(comp => {
          if (comp.type === "smartlightled" && comp.id === smartLightLed?.id) {
            return { ...comp, state: null, color: null, power: null, on: false };
          }
          return comp;
        })
      );
      setOutputLog(prev => [...prev, "No valid connection chain for SmartLightLED"]);
    }
  };

  useEffect(() => {
    if (!javascriptGenerator) {
      console.error("JavaScript generator not initialized!");
      return;
    }

    // Define Start Block
    Blockly.Blocks["start"] = {
      init: function () {
        this.appendDummyInput().appendField("Start");
        this.setNextStatement(true);
        this.setColour(0);
        this.setTooltip("Starting point of the program");
      },
    };
    javascriptGenerator["start"] = function () {
      return "// Start of program\n";
    };

    // Define IoT Component Blocks
    componentsList.forEach((comp) => {
      Blockly.Blocks[comp.type] = {
        init: function () {
          this.appendDummyInput().appendField(comp.name);
          this.appendDummyInput()
            .appendField("Pin")
            .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
          this.setPreviousStatement(true, null);
          this.setNextStatement(true, null);
          this.setColour(180);
          this.setTooltip(`Controls the ${comp.name} with pin configuration`);
        },
      };
      javascriptGenerator[comp.type] = function (block) {
        const pin = block.getFieldValue("PIN");
        const device = pinDeviceMap[pin]?.device || comp.type.toUpperCase();
        return `activate${device}("${pin}");\n`;
      };
    });

    // Connection Check Block
    Blockly.Blocks["connection_check"] = {
      init: function () {
        this.appendDummyInput().appendField("Check Connection");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Checks if components are connected");
      },
    };
    javascriptGenerator["connection_check"] = function () {
      return "checkConnection();\n";
    };

    // Smart Light VIBGYOR Block
    Blockly.Blocks["smartlight_vibgyor"] = {
      init: function () {
        this.appendDummyInput().appendField("Smart Light VIBGYOR");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Displays VIBGYOR colors on Smart Light");
      },
    };
    javascriptGenerator["smartlight_vibgyor"] = function (block) {
      const pin = block.getFieldValue("PIN");
      return `smartLightVibgyor("${pin}");\n`;
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
        this.appendDummyInput()
          .appendField("seconds on Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
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
      const pin = block.getFieldValue("PIN");
      return `setSmartLightLedColourSeconds("${led}", "${colour}", ${seconds}, "${pin}");\n`;
    };

    // SmartLightLED Colour Power Dropdown Block
    Blockly.Blocks["smartlightled_colour_power"] = {
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
            ["Low (20%)", "20"], ["Medium (50%)", "50"], ["High (100%)", "100"]
          ]), "POWER");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Set SmartLightLED colour and power level");
      },
    };
    javascriptGenerator["smartlightled_colour_power"] = function (block) {
      const led = block.getFieldValue("LED");
      const colour = block.getFieldValue("COLOUR");
      const power = block.getFieldValue("POWER");
      const pin = block.getFieldValue("PIN");
      return `setSmartLightLedColourPower("${led}", "${colour}", ${power}, "${pin}");\n`;
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
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
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
      const pin = block.getFieldValue("PIN");
      return `setSmartLightLedDropdownColourPower("${led}", "${colour}", ${power}, "${pin}");\n`;
    };

    // Tri-Color LED Blocks
    Blockly.Blocks["led_rgb_intensity"] = {
      init: function () {
        this.appendValueInput("R").setCheck("Number").appendField("RGB LED R:");
        this.appendValueInput("G").setCheck("Number").appendField("G:");
        this.appendValueInput("B").setCheck("Number").appendField("B:");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Set RGB intensity for Tri-Color LED");
      },
    };
    javascriptGenerator["led_rgb_intensity"] = function (block) {
      const r = javascriptGenerator.valueToCode(block, "R", javascriptGenerator.ORDER_ATOMIC) || "0";
      const g = javascriptGenerator.valueToCode(block, "G", javascriptGenerator.ORDER_ATOMIC) || "0";
      const b = javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) || "0";
      const pin = block.getFieldValue("PIN");
      return `setLedRGB(${r}, ${g}, ${b}, "${pin}");\n`;
    };

    Blockly.Blocks["led_color_picker"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Tri-Color Picker")
          .appendField(new Blockly.FieldDropdown([
            ["Red", "red"], ["Green", "green"], ["Blue", "blue"], ["Yellow", "yellow"]
          ]), "COLOR");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["led_color_picker"] = function (block) {
      const color = block.getFieldValue("COLOR");
      const pin = block.getFieldValue("PIN");
      return `setLedColor("${color}", "${pin}");\n`;
    };

    Blockly.Blocks["led_color_switch"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Tri-Color")
          .appendField(new Blockly.FieldDropdown([
            ["Red", "red"], ["Green", "green"], ["Blue", "blue"]
          ]), "COLOR")
          .appendField("Switch")
          .appendField(new Blockly.FieldDropdown([["ON", "true"], ["OFF", "false"]]), "STATE");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["led_color_switch"] = function (block) {
      const color = block.getFieldValue("COLOR");
      const state = block.getFieldValue("STATE");
      const pin = block.getFieldValue("PIN");
      return `setLedSwitch("${color}", ${state}, "${pin}");\n`;
    };

    // Buzzer Blocks
    Blockly.Blocks["buzzer_frequency"] = {
      init: function () {
        this.appendValueInput("FREQ").setCheck("Number").appendField("Buzzer Frequency");
        this.appendValueInput("DURATION").setCheck("Number").appendField("Duration (s)");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Play a frequency on the buzzer for a duration");
      },
    };
    javascriptGenerator["buzzer_frequency"] = function (block) {
      const freq = javascriptGenerator.valueToCode(block, "FREQ", javascriptGenerator.ORDER_ATOMIC) || "0";
      const duration = javascriptGenerator.valueToCode(block, "DURATION", javascriptGenerator.ORDER_ATOMIC) || "0";
      const pin = block.getFieldValue("PIN");
      return `playBuzzerFrequency(${freq}, ${duration}, "${pin}");\n`;
    };

    Blockly.Blocks["buzzer_music"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Buzzer Music")
          .appendField(new Blockly.FieldDropdown([
            ["Happy Birthday", "happy_birthday"],
            ["Twinkle Twinkle", "twinkle_twinkle"],
          ]), "SONG");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Play a predefined song on the buzzer");
      },
    };
    javascriptGenerator["buzzer_music"] = function (block) {
      const song = block.getFieldValue("SONG");
      const pin = block.getFieldValue("PIN");
      return `playBuzzerMusic("${song}", "${pin}");\n`;
    };

    // 7-Segment Blocks
    Blockly.Blocks["sevensegment_leds"] = {
      init: function () {
        this.appendValueInput("LED1").setCheck("Boolean").appendField("7-Segment LED1");
        this.appendValueInput("LED2").setCheck("Boolean").appendField("LED2");
        this.appendValueInput("LED3").setCheck("Boolean").appendField("LED3");
        this.appendValueInput("LED4").setCheck("Boolean").appendField("LED4");
        this.appendValueInput("LED5").setCheck("Boolean").appendField("LED5");
        this.appendValueInput("LED6").setCheck("Boolean").appendField("LED6");
        this.appendValueInput("LED7").setCheck("Boolean").appendField("LED7");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Control individual LEDs of the 7-segment display");
      },
    };
    javascriptGenerator["sevensegment_leds"] = function (block) {
      const led1 = javascriptGenerator.valueToCode(block, "LED1", javascriptGenerator.ORDER_ATOMIC) || "false";
      const led2 = javascriptGenerator.valueToCode(block, "LED2", javascriptGenerator.ORDER_ATOMIC) || "false";
      const led3 = javascriptGenerator.valueToCode(block, "LED3", javascriptGenerator.ORDER_ATOMIC) || "false";
      const led4 = javascriptGenerator.valueToCode(block, "LED4", javascriptGenerator.ORDER_ATOMIC) || "false";
      const led5 = javascriptGenerator.valueToCode(block, "LED5", javascriptGenerator.ORDER_ATOMIC) || "false";
      const led6 = javascriptGenerator.valueToCode(block, "LED6", javascriptGenerator.ORDER_ATOMIC) || "false";
      const led7 = javascriptGenerator.valueToCode(block, "LED7", javascriptGenerator.ORDER_ATOMIC) || "false";
      const pin = block.getFieldValue("PIN");
      return `setSevenSegmentLeds(${led1}, ${led2}, ${led3}, ${led4}, ${led5}, ${led6}, ${led7}, "${pin}");\n`;
    };

    Blockly.Blocks["sevensegment_numbers"] = {
      init: function () {
        this.appendValueInput("NUMBER").setCheck("Number").appendField("7-Segment Number");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Display a number on the 7-segment display");
      },
    };
    javascriptGenerator["sevensegment_numbers"] = function (block) {
      const number = javascriptGenerator.valueToCode(block, "NUMBER", javascriptGenerator.ORDER_ATOMIC) || "0";
      const pin = block.getFieldValue("PIN");
      return `setSevenSegmentNumber(${number}, "${pin}");\n`;
    };

    Blockly.Blocks["sevensegment_letters"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("7-Segment Letter")
          .appendField(new Blockly.FieldTextInput("A"), "LETTER");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Display a letter on the 7-segment display");
      },
    };
    javascriptGenerator["sevensegment_letters"] = function (block) {
      const letter = block.getFieldValue("LETTER");
      const pin = block.getFieldValue("PIN");
      return `setSevenSegmentLetter("${letter}", "${pin}");\n`;
    };

    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        { kind: "category", name: "Start", colour: "#ff0000", contents: [{ kind: "block", type: "start" }] },
        { kind: "category", name: "Logic", colour: "#0288d1", contents: [
          { kind: "block", type: "controls_if" },
          { kind: "block", type: "logic_compare" },
          { kind: "block", type: "logic_operation" },
          { kind: "block", type: "logic_negate" },
          { kind: "block", type: "logic_boolean" },
        ]},
        { kind: "category", name: "Loops", colour: "#d81b60", contents: [
          { kind: "block", type: "controls_repeat_ext" },
          { kind: "block", type: "controls_whileUntil" },
          { kind: "block", type: "controls_for" },
          { kind: "block", type: "controls_flow_statements" },
        ]},
        { kind: "category", name: "Math", colour: "#388e3c", contents: [
          { kind: "block", type: "math_number" },
          { kind: "block", type: "math_arithmetic" },
          { kind: "block", type: "math_random_int" },
          { kind: "block", type: "math_modulo" },
        ]},
        { kind: "category", name: "Text", colour: "#7b1fa2", contents: [
          { kind: "block", type: "text" },
          { kind: "block", type: "text_length" },
          { kind: "block", type: "text_join" },
        ]},
        { kind: "category", name: "Time", colour: "#f57c00", contents: [
          { kind: "block", type: "delay_wait" },
        ]},
        { kind: "category", name: "Lists", colour: "#c2185b", contents: [
          { kind: "block", type: "lists_create_with" },
          { kind: "block", type: "lists_length" },
          { kind: "block", type: "lists_isEmpty" },
          { kind: "block", type: "lists_getIndex" },
        ]},
        { kind: "category", name: "Variables", custom: "VARIABLE", colour: "#f9a825" },
        { kind: "category", name: "Functions", custom: "PROCEDURE", colour: "#6d4c41" },
        { kind: "category", name: "IoT Components", colour: "#2e7d32", contents: [
          ...componentsList.map(comp => ({ kind: "block", type: comp.type })),
          { kind: "block", type: "connection_check" },
          { kind: "block", type: "smartlight_vibgyor" },
          { kind: "block", type: "smartlightled_colour_seconds" },
          { kind: "block", type: "smartlightled_colour_power" },
          { kind: "block", type: "smartlightled_dropdown_colour_power" },
          { kind: "block", type: "led_rgb_intensity" },
          { kind: "block", type: "led_color_picker" },
          { kind: "block", type: "led_color_switch" },
          { kind: "block", type: "buzzer_frequency" },
          { kind: "block", type: "buzzer_music" },
          { kind: "block", type: "sevensegment_leds" },
          { kind: "block", type: "sevensegment_numbers" },
          { kind: "block", type: "sevensegment_letters" },
        ]},
      ],
    };

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox,
      grid: { spacing: 20, length: 3, colour: "#b0bec5", snap: true },
      zoom: { controls: true, wheel: true, startScale: 1.0, maxScale: 3, minScale: 0.3 },
      trashcan: true,
    });
    workspaceRef.current = workspace;

    // Backend Simulation Functions
    window.activateBUZZER = (pin) => {
      setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: The buzzer will turn on, and I need sound.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "buzzer" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "on", pin } : comp
        )
      );
    };

    window.activateSEVENSEGMENT = (pin) => {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: It is showing the number.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sevensegment" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "number", pin } : comp
        )
      );
    };

    window.activateSOIL_SENSOR = (pin) => {
      setOutputLog((prev) => [...prev, `Soil Sensor on pin ${pin}: It is reading soil data.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sensor" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "reading", pin } : comp
        )
      );
    };

    window.activateDIP_SWITCH = (pin) => {
      setOutputLog((prev) => [...prev, `DIP Switch on pin ${pin}: It is toggled.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "switch" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "toggled", pin } : comp
        )
      );
    };

    window.activatePAN_AND_TILT = (pin) => {
      setOutputLog((prev) => [...prev, `Pan & Tilt on pin ${pin}: The servo will rotate.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "pantilt" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "rotating", pin } : comp
        )
      );
    };

    window.activateWEATHER_MONITORING = (pin) => {
      setOutputLog((prev) => [...prev, `Weather Monitor on pin ${pin}: It senses temperature and humidity.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sensor" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "sensing", pin } : comp
        )
      );
    };

    window.activateTRI_COLOUR_LED = (pin) => {
      setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: The LED will glow.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "led" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "glowing", pin } : comp
        )
      );
    };

    window.activateULTRASONIC_SENSOR = (pin) => {
      setOutputLog((prev) => [...prev, `Ultrasonic Sensor on pin ${pin}: It senses the obstacle.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "object" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "sensing", pin } : comp
        )
      );
    };

    window.activateOLED = (pin) => {
      setOutputLog((prev) => [...prev, `OLED on pin ${pin}: It is showing the picture and number.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "oled" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "displaying", pin } : comp
        )
      );
    };

    window.activateDC_MOTOR = (pin) => {
      setOutputLog((prev) => [...prev, `DC Motor on pin ${pin}: The motor will rotate.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "motor" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "rotating", pin } : comp
        )
      );
    };

    window.activateJOYSTICK = (pin) => {
      setOutputLog((prev) => [...prev, `Joystick on pin ${pin}: It is showing the X-axis and Y-axis values.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "joystick" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "active", pin } : comp
        )
      );
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
          comp.type === "smartlight" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "vibgyor", pin } : comp
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

    window.setLedRGB = (r, g, b, pin) => {
      setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: RGB(${r}, ${g}, ${b})`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "led" && (!comp.pin || comp.pin === pin) ? { ...comp, r: parseInt(r), g: parseInt(g), b: parseInt(b), pin } : comp
        )
      );
    };

    window.setLedColor = (color, pin) => {
      setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: Color ${color}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "led" && (!comp.pin || comp.pin === pin) ? { ...comp, color, pin } : comp
        )
      );
    };

    window.setLedSwitch = (color, state, pin) => {
      setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: ${color} ${state === "true" ? "ON" : "OFF"}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "led" && (!comp.pin || comp.pin === pin) ? { ...comp, color, on: state === "true", pin } : comp
        )
      );
    };

    window.playBuzzerFrequency = (freq, duration, pin) => {
      setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: Playing ${freq}Hz for ${duration}s`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "buzzer" && (!comp.pin || comp.pin === pin) ? { ...comp, freq: parseInt(freq), duration: parseFloat(duration), pin } : comp
        )
      );
    };

    window.playBuzzerMusic = (song, pin) => {
      setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: Playing ${song}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "buzzer" && (!comp.pin || comp.pin === pin) ? { ...comp, song, pin } : comp
        )
      );
    };

    window.setSevenSegmentLeds = (led1, led2, led3, led4, led5, led6, led7, pin) => {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: LED1=${led1}, LED2=${led2}, LED3=${led3}, LED4=${led4}, LED5=${led5}, LED6=${led6}, LED7=${led7}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sevensegment" && (!comp.pin || comp.pin === pin) ? { ...comp, leds: { led1, led2, led3, led4, led5, led6, led7 }, pin } : comp
        )
      );
    };

    window.setSevenSegmentNumber = (num, pin) => {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: Number ${num}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sevensegment" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "displaying", value: parseInt(num), pin } : comp
        )
      );
    };

    window.setSevenSegmentLetter = (letter, pin) => {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: Letter ${letter}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sevensegment" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "displaying", value: letter, pin } : comp
        )
      );
    };

    window.checkConnection = checkConnection;

    return () => workspace.dispose();
  }, [componentsList]);

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
      const asyncFunc = new Function(`return (async () => {\n${code}\n})();`);
      await asyncFunc();
      setSnackbarOpen(true);
    } catch (error) {
      setOutputLog([...outputLog, `Error: ${error.message}`]);
      console.error(error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: 1 }}>
                Sheshgyan Simulator
              </Typography>
              <Button color="inherit" onClick={runCode} startIcon={<PlayArrowIcon />}>
                Run Code
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: "flex", gap: 3, height: "80vh" }}>
              <Paper sx={{ width: isMinimized ? "100%" : "50%", p: 3, overflow: "hidden" }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#0288d1", fontWeight: 500 }}>
                  Blockly Editor
                </Typography>
                <div ref={blocklyDiv} style={{ height: "calc(100% - 40px)", width: "100%", borderRadius: 8, overflow: "hidden" }} />
              </Paper>

              {!isMinimized && (
                <Box sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 3 }}>
                  <Paper sx={{ p: 3, flex: "0 0 auto", maxHeight: "30%", overflowX: "auto", overflowY: "hidden" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6" sx={{ color: "#0288d1", fontWeight: 500 }}>
                        IoT Components
                      </Typography>
                      <IconButton onClick={() => setIsMinimized(true)}>
                        <MinimizeIcon />
                      </IconButton>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "nowrap" }}>
                      {componentsList.map((comp) => (
                        <DraggableComponent
                          key={comp.id}
                          id={comp.id}
                          name={comp.name}
                          type={comp.type}
                          image={comp.image}
                          onAddComponent={handleAddComponent}
                        />
                      ))}
                    </Box>
                  </Paper>

                  <Paper sx={{ p: 3, flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#0288d1", fontWeight: 500 }}>
                      Workspace
                    </Typography>
                    <Workspace
                      components={components}
                      setComponents={setComponents}
                      wires={wires}
                      setWires={setWires}
                    />
                  </Paper>
                </Box>
              )}

              {isMinimized && (
                <IconButton onClick={() => setIsMinimized(false)} sx={{ position: "absolute", right: 20, top: 80 }}>
                  <MaximizeIcon />
                </IconButton>
              )}
            </Box>

            <Paper sx={{ mt: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#0288d1", fontWeight: 500 }}>
                Output Log
              </Typography>
              {outputLog.length === 0 ? (
                <Typography variant="body2" color="textSecondary">No output yet...</Typography>
              ) : (
                outputLog.map((log, index) => (
                  <Typography key={index} variant="body2" sx={{ fontFamily: "monospace", color: log.includes("Error") ? "#d32f2f" : "#333" }}>
                    {log}
                  </Typography>
                ))
              )}
            </Paper>
          </Container>

          <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
            <Alert severity="success" onClose={() => setSnackbarOpen(false)} sx={{ width: "100%", borderRadius: 2 }}>
              Code executed successfully!
            </Alert>
          </Snackbar>
        </Box>
      </DndProvider>
    </ThemeProvider>
  );
};

export default IoTSimulator;
