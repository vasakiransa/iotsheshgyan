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
  },
});

const IoTSimulator = () => {
  const [components, setComponents] = useState([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [outputLog, setOutputLog] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);

  // ESP32 (IoT Bridge) pins starting from C01
  const esp32Pins = [
    "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C11", "C12"
  ];

  // RGB LED pins
  const rgbLedPins = ["C011", "C012", "C013"];

  // Pin to Device Mapping
  const pinDeviceMap = {
    "C01": { device: "BUZZER", description: "The buzzer will turn on, and I need sound." },
    "C02": { device: "SEVENSEGMENT", description: "It is showing the number." },
    "C03": { device: "SOIL_SENSOR", description: "It is reading soil data." },
    "C04": { device: "DIP_SWITCH", description: "It is toggled." },
    "C05": { device: "PAN_AND_TILT", description: "The servo will rotate." },
    "C06": { device: "WEATHER_MONITORING", description: "It senses temperature and humidity." },
    "C11": { device: "TRI_COLOUR_LED", description: "The LED will glow." },
    "C08": { device: "ULTRASONIC_SENSOR", description: "It senses the obstacle." },
    "C09": { device: "OLED", description: "It is showing the picture and number." },
    "C10": { device: "JOYSTICK", description: "It is showing the X-axis and Y-axis values." },
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
  ];
 
  
  const measureDistance = (components, setOutputLog) => {
    const sensor = components.find((comp) => comp.type === "sensor");
    const object = components.find((comp) => comp.type === "object");
  
    if (sensor && object) {
      const distance = Math.sqrt(
        Math.pow(sensor.x - object.x, 2) + Math.pow(sensor.y - object.y, 2)
      ).toFixed(2);
      setOutputLog((prev) => [
        ...prev,
        `Temp Sensor detected: Distance to Object is ${distance} pixels`,
      ]);
    } else {
      setOutputLog((prev) => [
        ...prev,
        `Measurement failed: ${!sensor ? "Temp Sensor missing" : ""} ${
          !object ? "Object missing" : ""
        }`,
      ]);
    }
  };
  const handleAddComponent = (id, name, type, image) => {
    setComponents((prev) => [
      ...prev,
      { id: `${id}-${Date.now()}`, name, type, image, x: 100, y: 100, pin: null },
    ]);
  };

  // Enhanced checkConnection function with C11 to C011 red light logic
  const checkConnection = () => {
    const bridge = components.find((comp) => comp.type === "bridge");
    if (!bridge || !bridge.pin) return;

    const connectedComponents = components.filter(
      (comp) => comp.type !== "bridge" && comp.pin
    );

    connectedComponents.forEach((comp) => {
      const deviceInfo = pinDeviceMap[comp.pin];
      if (deviceInfo) {
        const logMessage = `IoT Bridge on pin ${bridge.pin} connected to ${comp.name} on pin ${comp.pin}: ${deviceInfo.description}`;
        setOutputLog((prev) => {
          if (!prev.includes(logMessage)) return [...prev, logMessage];
          return prev;
        });
        setComponents((prev) =>
          prev.map((c) =>
            c.id === comp.id
              ? { ...c, state: deviceInfo.device === "TRI_COLOUR_LED" ? "glowing" : "active" }
              : c
          )
        );
      }

      // Special case for C11 to C011 connection
      if (
        bridge.pin === "C11" &&
        comp.type === "led" &&
        comp.pin === "C011"
      ) {
        setOutputLog((prev) => [
          ...prev,
          `IoT Bridge C11 connected to RGB LED C011: Red light glowing`,
        ]);
        setComponents((prev) =>
          prev.map((c) =>
            c.id === comp.id
              ? { ...c, state: "glowing", color: "red", r: 255, g: 0, b: 0 }
              : c
          )
        );
      }
    });
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
        this.setTooltip("Starting point of the program");
      },
    };
    javascriptGenerator["start"] = function () {
      return "// Start of program\n";
    };


    // IoT Component Blocks with Pin Configuration
    componentsList.forEach((comp) => {
      Blockly.Blocks[comp.type] = {
        init: function () {
          this.appendDummyInput().appendField(comp.name);
          this.appendDummyInput()
            .appendField("Pin")
            .appendField(
              new Blockly.FieldDropdown(
                comp.type === "led" 
                  ? rgbLedPins.map(pin => [pin, pin])
                  : esp32Pins.map(pin => [pin, pin])
              ), 
              "PIN"
            );
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
Blockly.Blocks["sensor"] = {
      init: function () {
        this.appendDummyInput().appendField("Ultra sonic Sensor");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(180);
        this.setTooltip("Measures distance to object if present");
      },
    };
    javascriptGenerator["sensor"] = function () {
      return "window.measureDistanceWrapper();\n";
    };
    // Smart Light Blocks
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

    // Tri-Color LED Blocks
    Blockly.Blocks["led_rgb_intensity"] = {
      init: function () {
        
        this.appendValueInput("B").setCheck("Number").appendField("TRICOLOUR LED BLACK:");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(rgbLedPins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
        this.setTooltip("Set RGB intensity for Tri-Color LED");
      },
    };
    javascriptGenerator["led_rgb_intensity"] = function (block) {
      const r = javascriptGenerator.valueToCode(block, "R", javascriptGenerator.ORDER_ATOMIC) || "0";
      const g = javascriptGenerator.valueToCode(block, "G", javascriptGenerator.ORDER_ATOMIC) || "0";
      const b = javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) || "1";
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
          .appendField(new Blockly.FieldDropdown(rgbLedPins.map(pin => [pin, pin])), "PIN");
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
          .appendField(new Blockly.FieldDropdown(rgbLedPins.map(pin => [pin, pin])), "PIN");
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
        this.appendValueInput("FREQ").setCheck("Number").appendField("Buzzer Frequency:");
        this.appendValueInput("DURATION").setCheck("Number").appendField("Duration (s):");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["buzzer_frequency"] = function (block) {
      const freq = javascriptGenerator.valueToCode(block, "FREQ", javascriptGenerator.ORDER_ATOMIC) || "440";
      const duration = javascriptGenerator.valueToCode(block, "DURATION", javascriptGenerator.ORDER_ATOMIC) || "1";
      const pin = block.getFieldValue("PIN");
      return `playBuzzerFrequency(${freq}, ${duration}, "${pin}");\n`;
    };

    Blockly.Blocks["buzzer_music"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("Buzzer Music")
          .appendField(new Blockly.FieldDropdown([["SaReGaMa", "saregama"], ["Happy Birthday", "happybirthday"]]), "SONG");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["buzzer_music"] = function (block) {
      const song = block.getFieldValue("SONG");
      const pin = block.getFieldValue("PIN");
      return `playBuzzerMusic("${song}", "${pin}");\n`;
    };

    // Seven Segment Display Blocks
    Blockly.Blocks["sevensegment_leds"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("7-Segment LEDs")
          .appendField("LED1").appendField(new Blockly.FieldDropdown([["ON", "true"], ["OFF", "false"]]), "LED1")
          .appendField("LED2").appendField(new Blockly.FieldDropdown([["ON", "true"], ["OFF", "false"]]), "LED2")
          .appendField("LED3").appendField(new Blockly.FieldDropdown([["ON", "true"], ["OFF", "false"]]), "LED3")
          .appendField("LED4").appendField(new Blockly.FieldDropdown([["ON", "true"], ["OFF", "false"]]), "LED4")
          .appendField("LED5").appendField(new Blockly.FieldDropdown([["ON", "true"], ["OFF", "false"]]), "LED5")
          .appendField("LED6").appendField(new Blockly.FieldDropdown([["ON", "true"], ["OFF", "false"]]), "LED6")
          .appendField("LED7").appendField(new Blockly.FieldDropdown([["ON", "true"], ["OFF", "false"]]), "LED7");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["sevensegment_leds"] = function (block) {
      const led1 = block.getFieldValue("LED1");
      const led2 = block.getFieldValue("LED2");
      const led3 = block.getFieldValue("LED3");
      const led4 = block.getFieldValue("LED4");
      const led5 = block.getFieldValue("LED5");
      const led6 = block.getFieldValue("LED6");
      const led7 = block.getFieldValue("LED7");
      const pin = block.getFieldValue("PIN");
      return `setSevenSegmentLeds(${led1}, ${led2}, ${led3}, ${led4}, ${led5}, ${led6}, ${led7}, "${pin}");\n`;
    };

    Blockly.Blocks["sevensegment_numbers"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("7-Segment Number")
          .appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"]]), "NUM");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["sevensegment_numbers"] = function (block) {
      const num = block.getFieldValue("NUM");
      const pin = block.getFieldValue("PIN");
      return `setSevenSegmentNumber(${num}, "${pin}");\n`;
    };

    Blockly.Blocks["sevensegment_letters"] = {
      init: function () {
        this.appendDummyInput()
          .appendField("7-Segment Letter")
          .appendField(new Blockly.FieldDropdown([["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"]]), "LETTER");
        this.appendDummyInput()
          .appendField("Pin")
          .appendField(new Blockly.FieldDropdown(esp32Pins.map(pin => [pin, pin])), "PIN");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(180);
      },
    };
    javascriptGenerator["sevensegment_letters"] = function (block) {
      const letter = block.getFieldValue("LETTER");
      const pin = block.getFieldValue("PIN");
      return `setSevenSegmentLetter("${letter}", "${pin}");\n`;
    };

    // Logic Blocks
    Blockly.Blocks["logic_if"] = {
      init: function () {
        this.appendValueInput("IF").setCheck("Boolean").appendField("if");
        this.appendStatementInput("DO").appendField("do");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(210);
      },
    };
    javascriptGenerator["logic_if"] = function (block) {
      const condition = javascriptGenerator.valueToCode(block, "IF", javascriptGenerator.ORDER_ATOMIC) || "false";
      const statements = javascriptGenerator.statementToCode(block, "DO");
      return `if (${condition}) {\n${statements}}\n`;
    };

    Blockly.Blocks["logic_compare"] = {
      init: function () {
        this.appendValueInput("A").appendField(new Blockly.FieldDropdown([["=", "EQ"], ["≠", "NEQ"], ["<", "LT"], [">", "GT"], ["≤", "LTE"], ["≥", "GTE"]]), "OP");
        this.appendValueInput("B");
        this.setOutput(true, "Boolean");
        this.setColour(210);
      },
    };
    javascriptGenerator["logic_compare"] = function (block) {
      const operator = block.getFieldValue("OP");
      const a = javascriptGenerator.valueToCode(block, "A", javascriptGenerator.ORDER_ATOMIC) || "0";
      const b = javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) || "0";
      const ops = { EQ: "==", NEQ: "!=", LT: "<", GT: ">", LTE: "<=", GTE: ">=" };
      return [`${a} ${ops[operator]} ${b}`, javascriptGenerator.ORDER_RELATIONAL];
    };

    Blockly.Blocks["logic_operation"] = {
      init: function () {
        this.appendValueInput("A").setCheck("Boolean").appendField(new Blockly.FieldDropdown([["and", "AND"], ["or", "OR"]]), "OP");
        this.appendValueInput("B").setCheck("Boolean");
        this.setOutput(true, "Boolean");
        this.setColour(210);
      },
    };
    javascriptGenerator["logic_operation"] = function (block) {
      const operator = block.getFieldValue("OP");
      const a = javascriptGenerator.valueToCode(block, "A", javascriptGenerator.ORDER_ATOMIC) || "false";
      const b = javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) || "false";
      const ops = { AND: "&&", OR: "||" };
      return [`${a} ${ops[operator]} ${b}`, javascriptGenerator.ORDER_LOGICAL_AND];
    };

    Blockly.Blocks["logic_not"] = {
      init: function () {
        this.appendValueInput("BOOL").setCheck("Boolean").appendField("not");
        this.setOutput(true, "Boolean");
        this.setColour(210);
      },
    };
    javascriptGenerator["logic_not"] = function (block) {
      const bool = javascriptGenerator.valueToCode(block, "BOOL", javascriptGenerator.ORDER_ATOMIC) || "false";
      return [`!${bool}`, javascriptGenerator.ORDER_LOGICAL_NOT];
    };

    Blockly.Blocks["logic_boolean"] = {
      init: function () {
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([["true", "TRUE"], ["false", "FALSE"]]), "BOOL");
        this.setOutput(true, "Boolean");
        this.setColour(210);
      },
    };
    javascriptGenerator["logic_boolean"] = function (block) {
      return [block.getFieldValue("BOOL") === "TRUE" ? "true" : "false", javascriptGenerator.ORDER_ATOMIC];
    };

    // Loops Blocks
    Blockly.Blocks["controls_repeat_ext"] = {
      init: function () {
        this.appendValueInput("TIMES").setCheck("Number").appendField("repeat");
        this.appendStatementInput("DO").appendField("do");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(120);
      },
    };
    javascriptGenerator["controls_repeat_ext"] = function (block) {
      const times = javascriptGenerator.valueToCode(block, "TIMES", javascriptGenerator.ORDER_ATOMIC) || "0";
      const do_ = javascriptGenerator.statementToCode(block, "DO");
      return `for(let i=0;i<${times};i++){\n${do_}}\n`;
    };

    Blockly.Blocks["controls_whileUntil"] = {
      init: function () {
        this.appendValueInput("BOOL").setCheck("Boolean").appendField("repeat while");
        this.appendStatementInput("DO").appendField("do");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(120);
      },
    };
    javascriptGenerator["controls_whileUntil"] = function (block) {
      const bool = javascriptGenerator.valueToCode(block, "BOOL", javascriptGenerator.ORDER_ATOMIC) || "false";
      const do_ = javascriptGenerator.statementToCode(block, "DO");
      return `while(${bool}){\n${do_}}\n`;
    };

    Blockly.Blocks["controls_for"] = {
      init: function () {
        this.appendDummyInput().appendField("count with").appendField(new Blockly.FieldVariable("i"), "VAR").appendField("from");
        this.appendValueInput("FROM").setCheck("Number");
        this.appendDummyInput().appendField("to");
        this.appendValueInput("TO").setCheck("Number");
        this.appendDummyInput().appendField("by");
        this.appendValueInput("BY").setCheck("Number");
        this.appendStatementInput("DO").appendField("do");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(120);
      },
    };
    javascriptGenerator["controls_for"] = function (block) {
      const variable = javascriptGenerator.nameDB_.getName(block.getFieldValue("VAR"), Blockly.Names.NameType.VARIABLE);
      const from = javascriptGenerator.valueToCode(block, "FROM", javascriptGenerator.ORDER_ATOMIC) || "0";
      const to = javascriptGenerator.valueToCode(block, "TO", javascriptGenerator.ORDER_ATOMIC) || "0";
      const by = javascriptGenerator.valueToCode(block, "BY", javascriptGenerator.ORDER_ATOMIC) || "1";
      const do_ = javascriptGenerator.statementToCode(block, "DO");
      return `for(let ${variable}=${from};${variable}<=${to};${variable}+=${by}){\n${do_}}\n`;
    };

    Blockly.Blocks["controls_break"] = {
      init: function () {
        this.appendDummyInput().appendField("break out of loop");
        this.setPreviousStatement(true);
        this.setColour(120);
      },
    };
    javascriptGenerator["controls_break"] = function () {
      return "break;\n";
    };

    // Math Blocks
    Blockly.Blocks["math_number"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(new Blockly.FieldNumber(0), "NUM");
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
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([["+", "ADD"], ["-", "MINUS"], ["×", "MULTIPLY"], ["÷", "DIVIDE"]]), "OP");
        this.appendValueInput("B").setCheck("Number");
        this.setOutput(true, "Number");
        this.setColour(230);
      },
    };
    javascriptGenerator["math_arithmetic"] = function (block) {
      const operator = block.getFieldValue("OP");
      const a = javascriptGenerator.valueToCode(block, "A", javascriptGenerator.ORDER_ATOMIC) || "0";
      const b = javascriptGenerator.valueToCode(block, "B", javascriptGenerator.ORDER_ATOMIC) || "0";
      const ops = { ADD: "+", MINUS: "-", MULTIPLY: "*", DIVIDE: "/" };
      return [`${a} ${ops[operator]} ${b}`, javascriptGenerator.ORDER_ADDITION];
    };

    Blockly.Blocks["math_random_int"] = {
      init: function () {
        this.appendValueInput("FROM").setCheck("Number").appendField("random integer from");
        this.appendValueInput("TO").setCheck("Number").appendField("to");
        this.setOutput(true, "Number");
        this.setColour(230);
      },
    };
    javascriptGenerator["math_random_int"] = function (block) {
      const from = javascriptGenerator.valueToCode(block, "FROM", javascriptGenerator.ORDER_ATOMIC) || "0";
      const to = javascriptGenerator.valueToCode(block, "TO", javascriptGenerator.ORDER_ATOMIC) || "1";
      return [`Math.floor(Math.random()*(${to}-${from}+1)+${from})`, javascriptGenerator.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks["math_modulo"] = {
      init: function () {
        this.appendValueInput("DIVIDEND").setCheck("Number").appendField("remainder of");
        this.appendValueInput("DIVISOR").setCheck("Number").appendField("÷");
        this.setOutput(true, "Number");
        this.setColour(230);
      },
    };
    javascriptGenerator["math_modulo"] = function (block) {
      const dividend = javascriptGenerator.valueToCode(block, "DIVIDEND", javascriptGenerator.ORDER_ATOMIC) || "0";
      const divisor = javascriptGenerator.valueToCode(block, "DIVISOR", javascriptGenerator.ORDER_ATOMIC) || "1";
      return [`${dividend} % ${divisor}`, javascriptGenerator.ORDER_MODULUS];
    };

    // Text Blocks
    Blockly.Blocks["text"] = {
      init: function () {
        this.appendDummyInput()
          .appendField(new Blockly.FieldTextInput(""), "TEXT");
        this.setOutput(true, "String");
        this.setColour(160);
      },
    };
    javascriptGenerator["text"] = function (block) {
      const text = block.getFieldValue("TEXT");
      return [`"${text}"`, javascriptGenerator.ORDER_ATOMIC];
    };

    Blockly.Blocks["text_length"] = {
      init: function () {
        this.appendValueInput("VALUE").setCheck("String").appendField("length of");
        this.setOutput(true, "Number");
        this.setColour(160);
      },
    };
    javascriptGenerator["text_length"] = function (block) {
      const value = javascriptGenerator.valueToCode(block, "VALUE", javascriptGenerator.ORDER_ATOMIC) || "''";
      return [`${value}.length`, javascriptGenerator.ORDER_MEMBER];
    };

    Blockly.Blocks["text_join"] = {
      init: function () {
        this.appendValueInput("ADD0").appendField("create text with");
        this.appendValueInput("ADD1");
        this.setOutput(true, "String");
        this.setColour(160);
      },
    };
    javascriptGenerator["text_join"] = function (block) {
      const add0 = javascriptGenerator.valueToCode(block, "ADD0", javascriptGenerator.ORDER_ATOMIC) || "''";
      const add1 = javascriptGenerator.valueToCode(block, "ADD1", javascriptGenerator.ORDER_ATOMIC) || "''";
      return [`${add0} + ${add1}`, javascriptGenerator.ORDER_ADDITION];
    };

    // Delay Block
    Blockly.Blocks["delay_wait"] = {
      init: function () {
        this.appendValueInput("SECONDS").setCheck("Number").appendField("wait");
        this.appendDummyInput().appendField("seconds");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(290);
      },
    };
    javascriptGenerator["delay_wait"] = function (block) {
      const seconds = javascriptGenerator.valueToCode(block, "SECONDS", javascriptGenerator.ORDER_ATOMIC) || "0";
      return `await new Promise(resolve => setTimeout(resolve, ${seconds} * 1000));\n`;
    };

    // Lists Blocks
    Blockly.Blocks["lists_create_with"] = {
      init: function () {
        this.appendValueInput("ADD0").appendField("create list with");
        this.appendValueInput("ADD1");
        this.setOutput(true, "Array");
        this.setColour(260);
      },
    };
    javascriptGenerator["lists_create_with"] = function (block) {
      const add0 = javascriptGenerator.valueToCode(block, "ADD0", javascriptGenerator.ORDER_COMMA) || "null";
      const add1 = javascriptGenerator.valueToCode(block, "ADD1", javascriptGenerator.ORDER_COMMA) || "null";
      return [`[${add0}, ${add1}]`, javascriptGenerator.ORDER_ATOMIC];
    };

    Blockly.Blocks["lists_length"] = {
      init: function () {
        this.appendValueInput("VALUE").setCheck("Array").appendField("length of");
        this.setOutput(true, "Number");
        this.setColour(260);
      },
    };
    javascriptGenerator["lists_length"] = function (block) {
      const value = javascriptGenerator.valueToCode(block, "VALUE", javascriptGenerator.ORDER_ATOMIC) || "[]";
      return [`${value}.length`, javascriptGenerator.ORDER_MEMBER];
    };

    Blockly.Blocks["lists_isEmpty"] = {
      init: function () {
        this.appendValueInput("VALUE").setCheck("Array").appendField("is empty");
        this.setOutput(true, "Boolean");
        this.setColour(260);
      },
    };
    javascriptGenerator["lists_isEmpty"] = function (block) {
      const value = javascriptGenerator.valueToCode(block, "VALUE", javascriptGenerator.ORDER_ATOMIC) || "[]";
      return [`${value}.length === 0`, javascriptGenerator.ORDER_RELATIONAL];
    };

    Blockly.Blocks["lists_sort"] = {
      init: function () {
        this.appendValueInput("LIST").setCheck("Array").appendField("sort list");
        this.setOutput(true, "Array");
        this.setColour(260);
      },
    };
    javascriptGenerator["lists_sort"] = function (block) {
      const list = javascriptGenerator.valueToCode(block, "LIST", javascriptGenerator.ORDER_ATOMIC) || "[]";
      return [`${list}.slice().sort()`, javascriptGenerator.ORDER_FUNCTION_CALL];
    };

    Blockly.Blocks["lists_get_random"] = {
      init: function () {
        this.appendValueInput("LIST").setCheck("Array").appendField("pick random item from");
        this.setOutput(true, null);
        this.setColour(260);
      },
    };
    javascriptGenerator["lists_get_random"] = function (block) {
      const list = javascriptGenerator.valueToCode(block, "LIST", javascriptGenerator.ORDER_ATOMIC) || "[]";
      return [`${list}[Math.floor(Math.random()*${list}.length)]`, javascriptGenerator.ORDER_FUNCTION_CALL];
    };

    // Functions
    Blockly.Blocks["procedures_defnoreturn"] = {
      init: function () {
        this.appendDummyInput().appendField("to").appendField(new Blockly.FieldTextInput("doSomething"), "NAME");
        this.appendStatementInput("STACK").appendField("do");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(290);
      },
    };
    javascriptGenerator["procedures_defnoreturn"] = function (block) {
      const funcName = javascriptGenerator.nameDB_.getName(block.getFieldValue("NAME"), Blockly.Names.NameType.PROCEDURE);
      const statements = javascriptGenerator.statementToCode(block, "STACK");
      return `function ${funcName}() {\n${statements}}\n`;
    };

    Blockly.Blocks["procedures_ifreturn"] = {
      init: function () {
        this.appendValueInput("CONDITION").setCheck("Boolean").appendField("if");
        this.appendValueInput("VALUE").appendField("return");
        this.setPreviousStatement(true);
        this.setColour(290);
      },
    };
    javascriptGenerator["procedures_ifreturn"] = function (block) {
      const condition = javascriptGenerator.valueToCode(block, "CONDITION", javascriptGenerator.ORDER_ATOMIC) || "false";
      const value = javascriptGenerator.valueToCode(block, "VALUE", javascriptGenerator.ORDER_ATOMIC) || "null";
      return `if (${condition}) { return ${value}; }\n`;
    };

    // JSON Block
    Blockly.Blocks["json_create"] = {
      init: function () {
        this.appendValueInput("KEY").setCheck("String").appendField("JSON key");
        this.appendValueInput("VALUE").appendField("value");
        this.setOutput(true, "String");
        this.setColour(20);
      },
    };
    javascriptGenerator["json_create"] = function (block) {
      const key = javascriptGenerator.valueToCode(block, "KEY", javascriptGenerator.ORDER_ATOMIC) || "''";
      const value = javascriptGenerator.valueToCode(block, "VALUE", javascriptGenerator.ORDER_ATOMIC) || "null";
      return [`JSON.stringify({${key}: ${value}})`, javascriptGenerator.ORDER_FUNCTION_CALL];
    };

    // Alert Block
    Blockly.Blocks["alert_notify"] = {
      init: function () {
        this.appendValueInput("MESSAGE").setCheck("String").appendField("alert");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(40);
      },
    };
    javascriptGenerator["alert_notify"] = function (block) {
      const message = javascriptGenerator.valueToCode(block, "MESSAGE", javascriptGenerator.ORDER_ATOMIC) || "''";
      return `alert(${message});\n`;
    };

    const toolbox = {
      kind: "categoryToolbox",
      contents: [
        { kind: "category", name: "Start", colour: "#ff0000", contents: [{ kind: "block", type: "start" }] },
        { kind: "category", name: "Logic", colour: "#0288d1", contents: [
          { kind: "block", type: "logic_if" },
          { kind: "block", type: "logic_compare" },
          { kind: "block", type: "logic_operation" },
          { kind: "block", type: "logic_not" },
          { kind: "block", type: "logic_boolean" },
        ]},
        { kind: "category", name: "Loops", colour: "#d81b60", contents: [
          { kind: "block", type: "controls_repeat_ext" },
          { kind: "block", type: "controls_whileUntil" },
          { kind: "block", type: "controls_for" },
          { kind: "block", type: "controls_break" },
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
          { kind: "block", type: "lists_sort" },
          { kind: "block", type: "lists_get_random" },
        ]},
        { kind: "category", name: "Variables", custom: "VARIABLE", colour: "#f9a825" },
        { kind: "category", name: "Functions", colour: "#6d4c41", contents: [
          { kind: "block", type: "procedures_defnoreturn" },
          { kind: "block", type: "procedures_ifreturn" },
        ]},
        { kind: "category", name: "JSON", colour: "#00897b", contents: [
          { kind: "block", type: "json_create" },
        ]},
        { kind: "category", name: "Alert", colour: "#d32f2f", contents: [
          { kind: "block", type: "alert_notify" },
        ]},
        { kind: "category", name: "IoT Components", colour: "#2e7d32", contents: [
          ...componentsList.map(comp => ({ kind: "block", type: comp.type })),
          { kind: "block", type: "smartlight_vibgyor" },
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

    // Backend Simulation Functions with Pin Logic
    window.activateBUZZER = (pin) => {
      setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: The buzzer will turn on, and I need sound.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "buzzer" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "on", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateSEVENSEGMENT = (pin) => {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: It is showing the number.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sevensegment" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "number", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateSOIL_SENSOR = (pin) => {
      setOutputLog((prev) => [...prev, `Soil Sensor on pin ${pin}: It is reading soil data.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sensor" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "reading", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateDIP_SWITCH = (pin) => {
      setOutputLog((prev) => [...prev, `DIP Switch on pin ${pin}: It is toggled.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "switch" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "toggled", pin } : comp
        )
      );
      checkConnection();
    };

    window.activatePAN_AND_TILT = (pin) => {
      setOutputLog((prev) => [...prev, `Pan & Tilt on pin ${pin}: The servo will rotate.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "pantilt" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "rotating", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateWEATHER_MONITORING = (pin) => {
      setOutputLog((prev) => [...prev, `Weather Monitor on pin ${pin}: It senses temperature and humidity.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sensor" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "sensing", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateTRI_COLOUR_LED = (pin) => {
      setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: The LED will glow.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "led" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "glowing", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateULTRASONIC_SENSOR = (pin) => {
      setOutputLog((prev) => [...prev, `Ultrasonic Sensor on pin ${pin}: It senses the obstacle.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "object" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "sensing", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateOLED = (pin) => {
      setOutputLog((prev) => [...prev, `OLED on pin ${pin}: It is showing the picture and number.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "oled" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "displaying", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateJOYSTICK = (pin) => {
      setOutputLog((prev) => [...prev, `Joystick on pin ${pin}: It is showing the X-axis and Y-axis values.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "joystick" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "active", pin } : comp
        )
      );
      checkConnection();
    };

    window.activateSMARTLIGHT = (pin) => {
      setOutputLog((prev) => [...prev, `Smart Light on pin ${pin}: It displays VIBGYOR colors.`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "smartlight" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "vibgyor", pin } : comp
        )
      );
      checkConnection();
    };

    window.smartLightVibgyor = (pin) => {
      setOutputLog((prev) => [...prev, `Smart Light on pin ${pin}: Displaying VIBGYOR colors`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "smartlight" && (!comp.pin || comp.pin === pin) ? { ...comp, state: "vibgyor", pin } : comp
        )
      );
      checkConnection();
    };

    window.setLedRGB = (r, g, b, pin) => {
      setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: RGB(${r}, ${g}, ${b})`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "led" && (!comp.pin || comp.pin === pin) ? { ...comp, r: parseInt(r), g: parseInt(g), b: parseInt(b), pin } : comp
        )
      );
      checkConnection();
    };

    window.setLedColor = (color, pin) => {
      setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: Color ${color}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "led" && (!comp.pin || comp.pin === pin) ? { ...comp, color, pin } : comp
        )
      );
      checkConnection();
    };

    window.setLedSwitch = (color, state, pin) => {
      setOutputLog((prev) => [...prev, `Tri-Color LED on pin ${pin}: ${color} ${state === "true" ? "ON" : "OFF"}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "led" && (!comp.pin || comp.pin === pin) ? { ...comp, color, on: state === "true", pin } : comp
        )
      );
      checkConnection();
    };

    window.playBuzzerFrequency = (freq, duration, pin) => {
      setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: Playing ${freq}Hz for ${duration}s`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "buzzer" && (!comp.pin || comp.pin === pin) ? { ...comp, freq: parseInt(freq), duration: parseFloat(duration), pin } : comp
        )
      );
      checkConnection();
    };

    window.playBuzzerMusic = (song, pin) => {
      setOutputLog((prev) => [...prev, `Buzzer on pin ${pin}: Playing ${song}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "buzzer" && (!comp.pin || comp.pin === pin) ? { ...comp, song, pin } : comp
        )
      );
      checkConnection();
    };

    window.setSevenSegmentLeds = (led1, led2, led3, led4, led5, led6, led7, pin) => {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: LED1=${led1}, LED2=${led2}, LED3=${led3}, LED4=${led4}, LED5=${led5}, LED6=${led6}, LED7=${led7}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sevensegment" && (!comp.pin || comp.pin === pin) ? { ...comp, leds: { led1, led2, led3, led4, led5, led6, led7 }, pin } : comp
        )
      );
      checkConnection();
    };

    window.setSevenSegmentNumber = (num, pin) => {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: Number ${num}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sevensegment" && (!comp.pin || comp.pin === pin) ? { ...comp, number: parseInt(num), pin } : comp
        )
      
      );
      checkConnection();
    };

    window.setSevenSegmentLetter = (letter, pin) => {
      setOutputLog((prev) => [...prev, `7-Segment on pin ${pin}: Letter ${letter}`]);
      setComponents((prev) =>
        prev.map((comp) =>
          comp.type === "sevensegment" && (!comp.pin || comp.pin === pin) ? { ...comp, letter, pin } : comp
        )
      );
      checkConnection();
    };

    checkConnection();

    return () => workspace.dispose();
  }, [components, componentsList]);

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
      checkConnection();
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
          <AppBar position="static" sx={{ background: "linear-gradient(to right, #0288d1, #4fc3f7)" }}>
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
              <Box sx={{ width: isMinimized ? "100%" : "50%", bgcolor: "#fff", borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.1)", p: 3, overflow: "hidden" }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#0288d1", fontWeight: 500 }}>
                  Blockly Editor
                </Typography>
                <div ref={blocklyDiv} style={{ height: "calc(100% - 40px)", width: "100%", borderRadius: 8, overflow: "hidden" }} />
              </Box>

              {!isMinimized && (
                <Box sx={{ width: "50%", display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ bgcolor: "#fff", borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.1)", p: 3, flex: "0 0 auto", maxHeight: "30%", overflowX: "auto", overflowY: "hidden" }}>
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
                  </Box>

                  <Box sx={{ bgcolor: "#fff", borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.1)", p: 3, flex: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: "#0288d1", fontWeight: 500 }}>
                      Workspace
                    </Typography>
                    <Workspace components={components} setComponents={setComponents} />
                  </Box>
                </Box>
              )}

              {isMinimized && (
                <IconButton onClick={() => setIsMinimized(false)} sx={{ position: "absolute", right: 20, top: 80 }}>
                  <MaximizeIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ mt: 3, p: 3, bgcolor: "#fff", borderRadius: 3, boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}>
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
            </Box>
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