import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { motion, useAnimation } from "framer-motion";

// Pin configurations with 30% increased size
const pinConfigurations = {
  bridge: {
    left: Array.from({ length: 12 }, (_, i) => ({
      name: `C${String(i + 1).padStart(3, "0")}`,
      x: 0,
      y: i * 22.93,
    })),
    right: Array.from({ length: 12 }, (_, i) => ({
      name: `right-${i + 1}`,
      x: 260,
      y: i * 22.93,
    })),
  },
  led: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: [{ name: "C012", x: 260, y: 130 }],
  },
  sevensegment: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: Array.from({ length: 4 }, (_, i) => ({
      name: `C${String(i + 1).padStart(3, "0")}`,
      x: 260,
      y: 50 + i * 45.93,
    })),
  },
  oled: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: [{ name: "C0010", x: 260, y: 130 }],
  },
  sensor: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: [{ name: "C008", x: 260, y: 130 }],
  },
  buzzer: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: [{ name: "C0010", x: 260, y: 130 }],
  },
  motor: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: [
      { name: "C009", x: 260, y: 91 },
      { name: "C007", x: 260, y: 124.8 },
      { name: "C008", x: 260, y: 158.6 },
    ],
  },
  pantilt: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: [{ name: "C012", x: 260, y: 130 }],
  },
  joystick: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: [
      { name: "VRX", x: 260, y: 91 },
      { name: "VRY", x: 260, y: 141.7 },
    ],
  },
  object: {
    left: [{ name: "GND", x: 0, y: 130 }],
    right: [{ name: "C012", x: 260, y: 130 }],
  },
  smartlightled: {
    left: [{ name: "IN", x: 0, y: 50 * 2 }],
    right: [],
  },
  smartlightcomponent: {
    left: [
      
      { name: "GND", x: 0, y: 50 * 2 },
    ],
    right: [{ name: "C012", x: 130 * 2, y: 50 * 2 },
      { name: "C013", x: 130 * 2, y: 50 * 3 }
    ]
    
    
    ,
  },
};
<<<<<<< HEAD

// Normalize pin names to ensure consistency (e.g., C11 -> C011)
const normalizePin = (pin) => {
  if (!pin) return pin;
  return pin.replace(/^C(\d{1,2})$/, (match, num) => `C${num.padStart(3, "0")}`);
};

const Workspace = ({ components, setComponents, wires, setWires, addWire }) => {
  const [draggingWire, setDraggingWire] = useState(null);
  const workspaceRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const controls = useAnimation();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "component",
    drop: (item, monitor) => {
      const { id, name, type, image } = item;
      const pins = pinConfigurations[type] || { left: [], right: [] };
      const offset = monitor.getClientOffset();
      const workspaceRect = workspaceRef.current.getBoundingClientRect();

      const newComponent = {
        id: `${id}-${Date.now()}`,
        name,
        type,
        image,
        x: offset.x - workspaceRect.left - 65,
        y: offset.y - workspaceRect.top - 65,
        pins: [...pins.left, ...pins.right],
        connectedPins: [],
        state: null,
        value: type === "sevensegment" ? 0 : null,
        angle: type === "pantilt" ? { pan: 0, tilt: 0 } : null,
        speed: type === "motor" ? 0 : null,
        direction: type === "motor" ? "forward" : null,
        displayText: type === "oled" ? "" : null,
        shapes: type === "oled" ? [] : null,
        xValue: type === "joystick" ? 0 : null,
        yValue: type === "joystick" ? 0 : null,
        r: type === "led" ? 0 : null,
        g: type === "led" ? 0 : null,
        b: type === "led" ? 0 : null,
      };

      setComponents((prev) => [...prev, newComponent]);
      console.log(`Added component: ${newComponent.id} (${type})`, newComponent);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  useEffect(() => {
    setIsMounted(true);
    setDraggingWire(null);
  }, []);

=======

// Normalize pin names to ensure consistency (e.g., C11 -> C011)
const normalizePin = (pin) => {
  if (!pin) return pin;
  return pin.replace(/^C(\d{1,2})$/, (match, num) => `C${num.padStart(3, "0")}`);
};

const Workspace = ({ components, setComponents, wires, setWires, addWire }) => {
  const [draggingWire, setDraggingWire] = useState(null);
  const workspaceRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const controls = useAnimation();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "component",
    drop: (item, monitor) => {
      const { id, name, type, image } = item;
      const pins = pinConfigurations[type] || { left: [], right: [] };
      const offset = monitor.getClientOffset();
      const workspaceRect = workspaceRef.current.getBoundingClientRect();

      const newComponent = {
        id: `${id}-${Date.now()}`,
        name,
        type,
        image,
        x: offset.x - workspaceRect.left - 65,
        y: offset.y - workspaceRect.top - 65,
        pins: [...pins.left, ...pins.right],
        connectedPins: [],
        state: null,
        value: type === "sevensegment" ? 0 : null,
        angle: type === "pantilt" ? { pan: 0, tilt: 0 } : null,
        speed: type === "motor" ? 0 : null,
        direction: type === "motor" ? "forward" : null,
        displayText: type === "oled" ? "" : null,
        shapes: type === "oled" ? [] : null,
        xValue: type === "joystick" ? 0 : null,
        yValue: type === "joystick" ? 0 : null,
        r: type === "led" ? 0 : null,
        g: type === "led" ? 0 : null,
        b: type === "led" ? 0 : null,
      };

      setComponents((prev) => [...prev, newComponent]);
      console.log(`Added component: ${newComponent.id} (${type})`, newComponent);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  useEffect(() => {
    setIsMounted(true);
    setDraggingWire(null);
  }, []);

>>>>>>> ef72941 (latest changes)
  const getPinPosition = (component, pinName) => {
    const pin = (component.pins || []).find((p) => normalizePin(p.name) === normalizePin(pinName));
    if (!pin) {
      console.warn(`Pin ${pinName} not found on component ${component.id}`);
      return { x: component.x, y: component.y };
    }
    return {
      x: component.x + pin.x + 7.8,
      y: component.y + pin.y + 7.8,
    };
  };

  const handleStartWire = (componentId, pinName, event) => {
    event.stopPropagation();
    event.preventDefault();
    if (event.button !== 0 || !isMounted) return;

    console.log(`handleStartWire called: ${componentId}, ${pinName}`);

    if (
      wires.some((wire) => wire.sourceId === componentId && normalizePin(wire.sourcePin) === normalizePin(pinName)) ||
      wires.some((wire) => wire.targetId === componentId && normalizePin(wire.targetPin) === normalizePin(pinName))
    ) {
      return;
    }

    const sourceComponent = components.find((comp) => comp.id === componentId);
    if (!sourceComponent) return;

    const pinPosition = getPinPosition(sourceComponent, pinName);
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    setDraggingWire({
      sourceId: componentId,
      sourcePin: normalizePin(pinName),
      x1: pinPosition.x,
      y1: pinPosition.y,
      x2: event.clientX - workspaceRect.left,
      y2: event.clientY - workspaceRect.top,
    });
  };

  const findOverlappingPin = (x, y, excludePin = null, excludeComponentId = null) => {
    for (const component of components || []) {
      if (component.id === excludeComponentId) continue;
      for (const pin of component.pins || []) {
        if (normalizePin(pin.name) === normalizePin(excludePin)) continue;
        const pinPos = getPinPosition(component, pin.name);
        const distance = Math.sqrt((pinPos.x - x) ** 2 + (pinPos.y - y) ** 2);
        if (distance < 19.5) {
          return { componentId: component.id, pin: pin.name };
        }
      }
    }
    return null;
  };

  const handleMoveWire = (event) => {
    if (draggingWire) {
      const workspaceRect = workspaceRef.current.getBoundingClientRect();
      setDraggingWire((prev) => ({
        ...prev,
        x2: event.clientX - workspaceRect.left,
        y2: event.clientY - workspaceRect.top,
      }));
    }
  };

  const handleEndWire = () => {
    if (!draggingWire) return;

    const overlappingPin = findOverlappingPin(
      draggingWire.x2,
      draggingWire.y2,
      draggingWire.sourcePin,
      draggingWire.sourceId
    );

    if (overlappingPin) {
      const { componentId: targetId, pin: targetPin } = overlappingPin;
      if (draggingWire.sourceId === targetId) {
        setDraggingWire(null);
        return;
      }
      if (
        wires.some((wire) => wire.sourceId === targetId && normalizePin(wire.sourcePin) === normalizePin(targetPin)) ||
        wires.some((wire) => wire.targetId === targetId && normalizePin(wire.targetPin) === normalizePin(targetPin))
      ) {
        setDraggingWire(null);
        return;
      }

      const targetComponent = components.find((c) => c.id === targetId);
      const sourceComponent = components.find((c) => c.id === draggingWire.sourceId);
      if (!targetComponent || !sourceComponent) {
        setDraggingWire(null);
        return;
      }

      const normalizedSourcePin = normalizePin(draggingWire.sourcePin);
      const normalizedTargetPin = normalizePin(targetPin);

      const targetPinPosition = getPinPosition(targetComponent, targetPin);
      const sourcePinPosition = getPinPosition(sourceComponent, draggingWire.sourcePin);

      const newWire = {
        id: `${draggingWire.sourceId}-${targetId}-${Date.now()}`,
        sourceId: draggingWire.sourceId,
        sourcePin: normalizedSourcePin,
        targetId: targetId,
        targetPin: normalizedTargetPin,
        x1: sourcePinPosition.x,
        y1: sourcePinPosition.y,
        x2: targetPinPosition.x,
        y2: targetPinPosition.y,
      };

      setWires((prev) => [...prev, newWire]);

      setComponents((prev) =>
        prev.map((comp) => {
          if (comp.id === targetId) {
            return {
              ...comp,
              connectedPins: [...(comp.connectedPins || []), normalizedTargetPin],
            };
          }
          if (comp.id === draggingWire.sourceId) {
            return {
              ...comp,
              connectedPins: [...(comp.connectedPins || []), normalizedSourcePin],
            };
          }
          return comp;
        })
      );

      console.log(
        `Wire created: ${sourceComponent.type}:${normalizedSourcePin} -> ${targetComponent.type}:${normalizedTargetPin}`
      );
      console.log(`New wire:`, newWire);
    }

    setDraggingWire(null);
  };

  const handleRemoveComponent = (componentId) => {
    setComponents((prev) => prev.filter((comp) => comp.id !== componentId));
    setWires((prevWires) =>
      prevWires.filter(
        (wire) => wire.sourceId !== componentId && wire.targetId !== componentId
      )
    );
    if (selectedComponentId === componentId) setSelectedComponentId(null);
  };

  const handleRemoveWire = (sourceId, sourcePin, targetId, targetPin) => {
    const normalizedSourcePin = normalizePin(sourcePin);
    const normalizedTargetPin = normalizePin(targetPin);
    setWires((prevWires) =>
      prevWires.filter(
        (wire) =>
          !(
            wire.sourceId === sourceId &&
            normalizePin(wire.sourcePin) === normalizedSourcePin &&
            wire.targetId === targetId &&
            normalizePin(wire.targetPin) === normalizedTargetPin
          )
      )
    );
    setComponents((prev) =>
      prev.map((comp) => {
        if (comp.id === sourceId) {
          return {
            ...comp,
            connectedPins: (comp.connectedPins || []).filter(
              (p) => normalizePin(p) !== normalizedSourcePin
            ),
          };
        }
        if (comp.id === targetId) {
          return {
            ...comp,
            connectedPins: (comp.connectedPins || []).filter(
              (p) => normalizePin(p) !== normalizedTargetPin
            ),
          };
        }
        return comp;
      })
    );
    console.log(
      `Removed wire: ${sourceId}:${normalizedSourcePin} -> ${targetId}:${normalizedTargetPin}`
    );
  };

  const getWirePath = (source, target, sourcePin, targetPin, sourceComponent, targetComponent) => {
    const componentWidth = 286; // Component width
    const componentHeight = 260; // Component height
    const clearance = 50; // Distance to extend control points for curvature
    const curveFactor = 0.5; // Controls the intensity of the curve
    const pinSegmentLength = 20; // Increased length of the visible segment near the pin

    // Determine pin sides (left or right) based on pin x-coordinates
    const isSourceLeft = sourcePin && sourcePin.x < componentWidth / 2;
    const isTargetLeft = targetPin && targetPin.x < componentWidth / 2;

    // Calculate component boundaries
    const sourceLeft = sourceComponent
      ? sourceComponent.x
      : source.x - componentWidth / 2;
    const sourceRight = sourceLeft + componentWidth;
    const sourceTop = sourceComponent
      ? sourceComponent.y
      : source.y - componentHeight / 2;
    const sourceBottom = sourceTop + componentHeight;

    const targetLeft = targetComponent
      ? targetComponent.x
      : target.x - componentWidth / 2;
    const targetRight = targetLeft + componentWidth;
    const targetTop = targetComponent
      ? targetComponent.y
      : target.y - componentHeight / 2;
    const targetBottom = targetTop + componentHeight;

    // Determine the overall bounding box of the two components
    const minX = Math.min(sourceLeft, targetLeft);
    const maxX = Math.max(sourceRight, targetRight);

    // Calculate points for the short segments near the pins
    const sourceSegmentEnd = {
      x: isSourceLeft ? source.x - pinSegmentLength : source.x + pinSegmentLength,
      y: source.y,
    };
    const targetSegmentStart = {
      x: isTargetLeft ? target.x - pinSegmentLength : target.x + pinSegmentLength,
      y: target.y,
    };

    // Calculate control points for the Bezier curve (main path between segments)
    let controlPoint1, controlPoint2;

    if (isSourceLeft && isTargetLeft) {
      // Both pins on the left side
      const midX = minX - clearance;
      controlPoint1 = {
        x: sourceSegmentEnd.x + (midX - sourceSegmentEnd.x) * curveFactor,
        y: sourceSegmentEnd.y,
      };
      controlPoint2 = {
        x: targetSegmentStart.x + (midX - targetSegmentStart.x) * curveFactor,
        y: targetSegmentStart.y,
      };
    } else if (!isSourceLeft && !isTargetLeft) {
      // Both pins on the right side
      const midX = maxX + clearance;
      controlPoint1 = {
        x: sourceSegmentEnd.x + (midX - sourceSegmentEnd.x) * curveFactor,
        y: sourceSegmentEnd.y,
      };
      controlPoint2 = {
        x: targetSegmentStart.x + (midX - targetSegmentStart.x) * curveFactor,
        y: targetSegmentStart.y,
      };
    } else if (isSourceLeft && !isTargetLeft) {
      // Source on left, target on right
      controlPoint1 = {
        x: sourceLeft - clearance,
        y: sourceSegmentEnd.y,
      };
      controlPoint2 = {
        x: targetRight + clearance,
        y: targetSegmentStart.y,
      };
    } else {
      // Source on right, target on left
      controlPoint1 = {
        x: sourceRight + clearance,
        y: sourceSegmentEnd.y,
      };
      controlPoint2 = {
        x: targetLeft - clearance,
        y: targetSegmentStart.y,
      };
    }

    // Return an object with the three segments
    return {
      sourceSegment: `M${source.x},${source.y} L${sourceSegmentEnd.x},${sourceSegmentEnd.y}`,
      mainPath: `M${sourceSegmentEnd.x},${sourceSegmentEnd.y} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${targetSegmentStart.x},${targetSegmentStart.y}`,
      targetSegment: `M${targetSegmentStart.x},${targetSegmentStart.y} L${target.x},${target.y}`,
    };
  };

  const getDraggingWirePath = (source, target) => {
    const pinSegmentLength = 20; // Increased length of the visible segment near the source pin
    const isSourceLeft = source.x < target.x; // Approximate direction based on mouse position

    // Short segment at the source pin
    const sourceSegmentEnd = {
      x: isSourceLeft ? source.x - pinSegmentLength : source.x + pinSegmentLength,
      y: source.y,
    };

    // Bezier curve from source segment end to mouse position
    const controlPoint1 = {
      x: sourceSegmentEnd.x + (target.x - sourceSegmentEnd.x) * 0.3,
      y: sourceSegmentEnd.y,
    };
    const controlPoint2 = {
      x: target.x - (target.x - sourceSegmentEnd.x) * 0.3,
      y: target.y,
    };

    return {
      sourceSegment: `M${source.x},${source.y} L${sourceSegmentEnd.x},${sourceSegmentEnd.y}`,
      mainPath: `M${sourceSegmentEnd.x},${sourceSegmentEnd.y} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${target.x},${target.y}`,
    };
  };

  const wiresToRender = wires.filter(
    (wire) =>
      components.some((comp) => comp.id === wire.sourceId) &&
      components.some((comp) => comp.id === wire.targetId)
  );

  const handleComponentClick = (componentId, event) => {
    event.stopPropagation();
    setSelectedComponentId(componentId);
    setIsDragging(false);
    const comp = components.find((c) => c.id === componentId);
    if (comp) {
      setDragOffset({
        x: event.clientX - comp.x,
        y: event.clientY - comp.y,
      });
    }
  };

  const handleMouseDown = (event) => {
    if (selectedComponentId) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (event) => {
    if (!isDragging || !selectedComponentId) return;

    setComponents((prev) =>
      prev.map((comp) => {
        if (comp.id === selectedComponentId) {
          const newX = event.clientX - dragOffset.x;
          const newY = event.clientY - dragOffset.y;
          return {
            ...comp,
            x: newX,
            y: newY,
          };
        }
        return comp;
      })
    );

    setWires((prevWires) =>
      prevWires.map((wire) => {
        if (wire.sourceId === selectedComponentId || wire.targetId === selectedComponentId) {
          const sourceComponent = components.find((c) => c.id === wire.sourceId);
          const targetComponent = components.find((c) => c.id === wire.targetId);

          if (!sourceComponent || !targetComponent) {
            return wire;
          }

          const sourcePinPosition = getPinPosition(sourceComponent, wire.sourcePin);
          const targetPinPosition = getPinPosition(targetComponent, wire.targetPin);

          return {
            ...wire,
            x1: sourcePinPosition.x,
            y1: sourcePinPosition.y,
            x2: targetPinPosition.x,
            y2: targetPinPosition.y,
          };
        }
        return wire;
      })
    );
  };

  useEffect(() => {
    components.forEach((comp) => {
      if (comp.type === "motor" && comp.state === "spinning" && comp.speed > 0) {
        controls.start({
          rotate: comp.direction === "forward" ? 360 : -360,
          transition: {
            repeat: Infinity,
            duration: 2 / (comp.speed / 255),
            ease: "linear",
          },
        });
      } else if (comp.type === "motor") {
        controls.stop();
      }
    });
  }, [components, controls]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMoveWire);
    window.addEventListener("mouseup", handleEndWire);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMoveWire);
      window.removeEventListener("mouseup", handleEndWire);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, selectedComponentId, dragOffset, components, draggingWire]);

  const renderComponentVisuals = (comp) => {
    console.log(`Rendering visuals for component ${comp.id} (${comp.type}):`, {
      state: comp.state,
      value: comp.value,
      angle: comp.angle,
      displayText: comp.displayText,
      shapes: comp.shapes,
      r: comp.r,
      g: comp.g,
      b: comp.b,
    });

    switch (comp.type) {
      case "led":
        const isOn = comp.r > 0 || comp.g > 0 || comp.b > 0;
        const ledColor = `rgb(${comp.r}, ${comp.g}, ${comp.b})`;

        return (
          <motion.div
            style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${
                isOn ? ledColor : "#aaa"
              }, ${isOn ? "#111" : "#555"})`,
              boxShadow: isOn
                ? `0 0 25px rgba(${comp.r}, ${comp.g}, ${comp.b}, 0.9),
                   inset 0 0 15px rgba(${comp.r}, ${comp.g}, ${comp.b}, 0.6)`
                : "inset 0 0 10px #333",
              border: "2px solid #222",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                position: "absolute",
                top: "15%",
                left: "15%",
                width: "20px",
                height: "20px",
                backgroundColor: "rgba(255,255,255,0.4)",
                borderRadius: "50%",
                filter: "blur(2px)",
              }}
            />
          </motion.div>
        );

      case "sevensegment":
        if (comp.state === "displaying" || comp.state === "displaying_letter") {
          const segmentMap = {
            "0": [1, 1, 1, 1, 1, 1, 0],
            "1": [0, 1, 1, 0, 0, 0, 0],
            "2": [1, 1, 0, 1, 1, 0, 1],
            "3": [1, 1, 1, 1, 0, 0, 1],
            "4": [0, 1, 1, 0, 0, 1, 1],
            "5": [1, 0, 1, 1, 0, 1, 1],
            "6": [1, 0, 1, 1, 1, 1, 1],
            "7": [1, 1, 1, 0, 0, 0, 0],
            "8": [1, 1, 1, 1, 1, 1, 1],
            "9": [1, 1, 1, 1, 0, 1, 1],
            "A": [1, 1, 1, 0, 1, 1, 1],
            "b": [0, 0, 1, 1, 1, 1, 1],
            "C": [1, 0, 0, 1, 1, 1, 0],
            "d": [0, 1, 1, 1, 1, 0, 1],
            "E": [1, 0, 0, 1, 1, 1, 1],
            "F": [1, 0, 0, 0, 1, 1, 1],
            "H": [0, 1, 1, 0, 1, 1, 1],
            "J": [0, 1, 1, 1, 0, 0, 0],
            "L": [0, 0, 0, 1, 1, 1, 0],
            "P": [1, 1, 0, 0, 1, 1, 1],
            "U": [0, 1, 1, 1, 1, 1, 0],
          };

          const segments = segmentMap[comp.value] || [0, 0, 0, 0, 0, 0, 0];

          const Segment = ({ on, style }) => (
            <div
              style={{
                ...style,
                backgroundColor: on ? "#f00" : "#300",
                transition: "background-color 0.2s",
              }}
            />
          );

          return (
            <motion.div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#000",
                width: "65px",
                height: "91px",
                borderRadius: "5.2px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Segment
                on={segments[0]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "12px",
                  width: "40px",
                  height: "6px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[1]}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "0px",
                  width: "6px",
                  height: "35px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[2]}
                style={{
                  position: "absolute",
                  bottom: "6px",
                  right: "0px",
                  width: "6px",
                  height: "35px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[3]}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "12px",
                  width: "40px",
                  height: "6px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[4]}
                style={{
                  position: "absolute",
                  bottom: "6px",
                  left: 0,
                  width: "6px",
                  height: "35px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[5]}
                style={{
                  position: "absolute",
                  top: "6px",
                  left: 0,
                  width: "6px",
                  height: "35px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[6]}
                style={{
                  position: "absolute",
                  top: "42.5px",
                  left: "12px",
                  width: "40px",
                  height: "6px",
                  borderRadius: "3px",
                }}
              />
            </motion.div>
          );
        } else if (comp.state === "displaying_pattern") {
          // Handle raw segment states for displaying_pattern
          const segments = [
            comp.value.a ? 1 : 0, // Segment a
            comp.value.b ? 1 : 0, // Segment b
            comp.value.c ? 1 : 0, // Segment c
            comp.value.d ? 1 : 0, // Segment d
            comp.value.e ? 1 : 0, // Segment e
            comp.value.f ? 1 : 0, // Segment f
            comp.value.g ? 1 : 0, // Segment g
          ];

          const Segment = ({ on, style }) => (
            <div
              style={{
                ...style,
                backgroundColor: on ? "#f00" : "#300",
                transition: "background-color 0.2s",
              }}
            />
          );

          return (
            <motion.div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#000",
                width: "65px",
                height: "91px",
                borderRadius: "5.2px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Segment
                on={segments[0]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "12px",
                  width: "40px",
                  height: "6px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[1]}
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "0px",
                  width: "6px",
                  height: "35px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[2]}
                style={{
                  position: "absolute",
                  bottom: "6px",
                  right: "0px",
                  width: "6px",
                  height: "35px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[3]}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "12px",
                  width: "40px",
                  height: "6px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[4]}
                style={{
                  position: "absolute",
                  bottom: "6px",
                  left: 0,
                  width: "6px",
                  height: "35px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[5]}
                style={{
                  position: "absolute",
                  top: "6px",
                  left: 0,
                  width: "6px",
                  height: "35px",
                  borderRadius: "3px",
                }}
              />
              <Segment
                on={segments[6]}
                style={{
                  position: "absolute",
                  top: "42.5px",
                  left: "12px",
                  width: "40px",
                  height: "6px",
                  borderRadius: "3px",
                }}
              />
            </motion.div>
          );
        }
        // Fallback for unhandled states
        return (
          <motion.div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#000",
              width: "65px",
              height: "91px",
              borderRadius: "5.2px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "2px",
                width: "100%",
                height: "100%",
              }}
            >
              <div
                style={{
                  gridColumn: "1 / span 3",
                  gridRow: "1",
                  backgroundColor: "#300",
                  height: "15%",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  gridColumn: "3",
                  gridRow: "1 / span 2",
                  backgroundColor: "#300",
                  width: "15%",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  gridColumn: "3",
                  gridRow: "2 / span 2",
                  backgroundColor: "#300",
                  width: "15%",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  gridColumn: "1 / span 3",
                  gridRow: "3",
                  backgroundColor: "#300",
                  height: "15%",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  gridColumn: "1",
                  gridRow: "2 / span 2",
                  backgroundColor: "#300",
                  width: "15%",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  gridColumn: "1",
                  gridRow: "1 / span 2",
                  backgroundColor: "#300",
                  width: "15%",
                  borderRadius: "3px",
                }}
              />
              <div
                style={{
                  gridColumn: "1 / span 3",
                  gridRow: "2",
                  backgroundColor: "#300",
                  height: "15%",
                  borderRadius: "3px",
                }}
              />
            </div>
          </motion.div>
        );

      case "buzzer":
        if (comp.state === "on" && comp.freq && comp.duration) {
          return (
            <motion.div
              style={{
                position: "absolute",
                top: "70%",
                left: "55%",
                transform: "translate(-50%, -50%)",
                fontSize: "18px",
                fontWeight: "bold",
                textAlign: "center",
                color: "#fff",
                backgroundColor: "#FF6347",
                padding: "12px 18px",
                borderRadius: "25px",
                boxShadow: "0 0 12px rgba(255, 99, 71, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "auto",
                minWidth: "150px",
                transition: "background-color 0.3s ease-in-out",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span>
                {comp.freq}Hz, {comp.duration}s
              </span>
            </motion.div>
          );
        } else if (comp.state === "played" && comp.song) {
          return (
            <motion.div
              style={{
                position: "absolute",
                top: "50%",
                left: "54%",
                transform: "translate(-50%, -50%)",
                fontSize: "18px",
                fontWeight: "bold",
                textAlign: "center",
                color: "#fff",
                backgroundColor: "#4CAF50",
                padding: "12px 18px",
                borderRadius: "25px",
                boxShadow: "0 0 12px rgba(76, 175, 80, 0.7)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "auto",
                minWidth: "150px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          );
        }
        return (
          <motion.div
            style={{
              position: "absolute",
              top: "55%",
              left: "63%",
              transform: "translate(-50%, -50%)",
              width: "80px",
              height: "80px",
              backgroundColor: "#ddd",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 0 12px rgba(0, 0, 0, 0.3)",
              cursor: "pointer",
              transition: "all 0.3s ease-in-out",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#fff",
                boxShadow: "0 0 8px rgba(255, 255, 255, 0.7)",
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "loop",
              }}
            />
          </motion.div>
        );

      case "pantilt":
        const panAngle = comp.angle?.pan || 0;
        const tiltAngle = comp.angle?.tilt || 0;

        return (
          <motion.svg
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            width="200"
            height="200"
            viewBox="0 0 200 200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <defs>
              <linearGradient
                id="silverGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#eee" />
                <stop offset="50%" stopColor="#bbb" />
                <stop offset="100%" stopColor="#888" />
              </linearGradient>
            </defs>

            {/* Pan Servo Arm - Horizontal */}
            <motion.g
              animate={{ rotate: panAngle }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              transform="rotate(0 100 100)"
              transform-origin="100 100"
            >
              <rect
                x="50"
                y="30"
                width="100"
                height="20"
                rx="5"
                fill="url(#silverGradient)"
                stroke="#444"
                strokeWidth="1"
              />
              <circle cx="100" cy="100" r="6" fill="#444" />
            </motion.g>

            {/* Tilt Servo Arm - Vertical (mounted on pan) */}
            <motion.g
              animate={{ rotate: tiltAngle }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              transform="rotate(0 100 100)"
              transform-origin="100 100"
            >
              <rect
                x="70"
                y="100"
                width="20"
                height="100"
                rx="5"
                fill="url(#silverGradient)"
                stroke="#444"
                strokeWidth="1"
              />
              <circle cx="100" cy="100" r="4" fill="#666" />
            </motion.g>

            {/* Base mount / housing
            <circle cx="100" cy="180" r="10" fill="#555" />
            <rect x="95" y="130" width="10" height="50" rx="3" fill="#999" /> */}
          </motion.svg>
        );
        case "smartlightled":
          return (
            <div
              style={{
                // position: "relative",
                // width: "300px",
                // height: "300px",
                // display: "flex",
                // alignItems: "center",
                // justifyContent: "center",
                // perspective: "1000px",
              }}
            >
              {/* Base Hexagon (Shadow Layer) */}
              <div
                style={{
                  // width: "120px",
                  // height: "104px",
                  // background: "linear-gradient(135deg, #2a2a2a, #1a1a1a)",
                  // clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  // boxShadow: "0 0 15px 5px rgba(0, 0, 0, 0.5)",
                  // position: "absolute",
                  // top: "50%",
                  // left: "50%",
                  // transform: "translate(-50%, -50%)",
                  // zIndex: 0,
                  // transition: "all 0.3s ease-in-out",
                }}
              />
              {/* Main Hexagon (LED) */}
              <div
                style={{
                  width: "250px",
                  height: "225px",
                  background: comp.state === "vibgyor"
                    ? "transparent"
                    : comp.on
                      ? `radial-gradient(circle, ${comp.color}, transparent)`
                      : "linear-gradient(135deg, #fff, #fff)",
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  boxShadow: comp.state === "vibgyor"
                    ? "0 0 50px 20px rgba(255, 255, 255, 0.7), inset 0 0 30px rgba(255, 255, 255, 0.5)"
                    : comp.on
                      ? `0 0 40px 15px ${comp.color}, inset 0 0 20px ${comp.color}`
                      : "0 0 15px 5px rgba(0, 0, 0, 0.3)",
                  opacity: comp.power ? comp.power / 100 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: comp.on || comp.state === "vibgyor" ? "#fff" : "#ccc",
                  fontWeight: "bold",
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: "16px",
                  textShadow: comp.on || comp.state === "vibgyor" ? "0 0 10px #fff" : "none",
                  position: "absolute",
                  top: "50%",
                  left: "56%",
                  transform: (comp.on || comp.state === "vibgyor") ? "translate(-50%, -50%) rotateY(360deg)" : "translate(-50%, -50%)",
                  transition: "all 0.5s ease-in-out",
                  zIndex: 1,
                  // animation: comp.on ? "pulse 2s infinite" : "none",
                }}
              >
                {comp.led && <span>{comp.led}</span>}
                {comp.state === "vibgyor" && (
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      background: "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet, red)",
                      backgroundSize: "400%",
                      clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                      animation: "rainbow 5s linear infinite",
                      opacity: 1,
                      zIndex: 0,
                      boxShadow: "0 0 30px 10px rgba(255, 255, 255, 0.3)",
                    }}
                  />
                )}
              </div>
              {/* Status Indicator */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  color: comp.state === "vibgyor" ? "#fff" : comp.on ? comp.color : "#999",
                  fontSize: "12px",
                  fontFamily: "'Roboto', sans-serif",
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {comp.state ? comp.state : "OFF"}
              </div>
            </div>
          );
        case "smartlightcomponent":
          return (
            <div
              style={{
                // position: "relative",
                // width: "200px",
                // height: "200px",
                // display: "flex",
                // alignItems: "center",
                // justifyContent: "center",
                // perspective: "1000px",
              }}
            >
              {/* Base Hexagon (Shadow Layer) */}
              <div
                style={{
                  // width: "80px",
                  // height: "69px",
                  // background: "linear-gradient(135deg, #2a2a2a, #1a1a1a)",
                  // clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  // boxShadow: "0 0 15px 5px rgba(0, 0, 0, 0.5)",
                  // position: "absolute",
                  // top: "50%",
                  // left: "50%",
                  // transform: "translate(-50%, -50%)",
                  // zIndex: 0,
                  // transition: "all 0.3s ease-in-out",
                }}
              />
              {/* Main Hexagon (Component) */}
              <div
                style={{
                  // width: "160px",
                  // height: "138px",
                  // background: comp.state === "active"
                  //   ? "linear-gradient(135deg, #00ffcc, #00cc99)"
                  //   : "linear-gradient(135deg, #666, #444)",
                  // clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  // boxShadow: comp.state === "active"
                  //   ? "0 0 30px 10px rgba(0, 255, 204, 0.5)"
                  //   : "0 0 15px 5px rgba(0, 0, 0, 0.3)",
                  // opacity: comp.state === "active" ? 1 : 0.7,
                  // display: "flex",
                  // alignItems: "center",
                  // justifyContent: "center",
                  // color: comp.state === "active" ? "#fff" : "#ccc",
                  // fontWeight: "bold",
                  // fontFamily: "'Roboto', sans-serif",
                  // fontSize: "14px",
                  // textShadow: comp.state === "active" ? "0 0 10px #fff" : "none",
                  // position: "absolute",
                  // top: "50%",
                  // left: "50%",
                  // transform: comp.state === "active" ? "translate(-50%, -50%) rotateY(360deg)" : "translate(-50%, -50%)",
                  // transition: "all 0.5s ease-in-out",
                  // zIndex: 1,
                }}
              >
                {comp.led && <span>{comp.led}</span>}
                <span>SmartLight</span>
              </div>
              {/* Status Indicator */}
              <div
                style={{
                  // position: "absolute",
                  // bottom: "-30px",
                  // color: comp.state === "active" ? "#00ffcc" : "#999",
                  // fontSize: "12px",
                  // fontFamily: "'Roboto', sans-serif",
                  // textAlign: "center",
                  // textTransform: "uppercase",
                  // letterSpacing: "1px",
                }}
              >
                {comp.state ? comp.state : ""}
              </div>
            </div>
          );
       case "motor":
  const isDual = comp.dual;
  let rotation = 0;
  let duration = 9999;

  if (isDual) {
    const speed1 = comp.speed?.motor1 || 0;
    const speed2 = comp.speed?.motor2 || 0;
    const dir1 = comp.direction?.motor1 === "anticlockwise" ? -1 : 1;
    const dir2 = comp.direction?.motor2 === "anticlockwise" ? -1 : 1;
    const avgSpeed = (speed1 + speed2) / 2;
    const avgDir = (dir1 + dir2) / 2;
    rotation = avgSpeed * avgDir * 360;
    duration = avgSpeed > 0 ? 2 / (avgSpeed / 255) : 9999;
  } else {
    const speed = comp.speed || 0;
    const direction = comp.direction === "backward" ? -1 : comp.direction === "forward" ? 1 : 0;
    rotation = speed * direction * 360;
    duration = speed > 0 && direction !== 0 ? 2 / (speed / 255) : 9999;
  }

  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
      initial={{ opacity: 0 }}
      animate={{
        opacity:
          comp.state === "on" ||
          comp.state === "spinning" ||
          comp.state === "running"
            ? 1
            : 0,
      }}
      transition={{ duration: 0.3 }}
    >
      <defs>
        <radialGradient id="tireGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#444" />
          <stop offset="100%" stopColor="#111" />
        </radialGradient>
        <radialGradient id="motorBody" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f7d44c" />
          <stop offset="100%" stopColor="#c8a601" />
        </radialGradient>
      </defs>

      {/* Rotating part: Tire + Rim (Spokes) */}
      <motion.g
        key={"wheel" + JSON.stringify(comp)}
        animate={{ rotate: rotation }}
        transition={{
          repeat:
            (comp.state === "spinning" || comp.state === "running") &&
            rotation !== 0
              ? Infinity
              : 0,
          ease: "linear",
          duration: duration,
        }}
        style={{ transformOrigin: "50% 50%" }}
      >
        {/* Outer Tire */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="url(#tireGradient)"
          stroke="#000"
          strokeWidth="4"
        />

        {/* Spokes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect
            key={i}
            x="48"
            y="12"
            width="4"
            height="25"
            rx="2"
            fill="#aaa"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}
      </motion.g>

      {/* Static Yellow Motor Body */}
      <g>
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="url(#motorBody)"
          stroke="#222"
          strokeWidth="2"
        />

        {/* Bottom Shaft */}
        <rect
          x="42"
          y="68"
          width="16"
          height="14"
          rx="2"
          fill="#ccc"
          stroke="#333"
          strokeWidth="1"
        />

        {/* Motor Details (like screws) */}
        <circle cx="45" cy="60" r="1.5" fill="#000" />
        <circle cx="55" cy="60" r="1.5" fill="#000" />
      </g>

      {/* Motor Info */}
      <text
        x="50"
        y="95"
        textAnchor="middle"
        fill="#fff"
        fontSize="9"
        fontFamily="monospace"
      >
        {isDual
          ? `D1:${comp.direction?.motor1 || "N/A"}-${comp.speed?.motor1 || 0} D2:${comp.direction?.motor2 || "N/A"}-${comp.speed?.motor2 || 0}`
          : `${comp.direction || "N/A"} @ ${comp.speed || 0}`}
      </text>
    </motion.svg>
  );

          
      case "oled":
        return (
          <motion.svg
            style={{
              position: "absolute",
              top: "48%",
              left: "52%",
              transform: "translate(-50%, -50%)",
            }}
            width="128"
            height="64"
            viewBox="0 0 128 64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <rect
              x="0"
              y="0"
              width="128"
              height="64"
              fill="black"
              stroke="#00ff00"
              strokeWidth="2"
              rx="8"
              ry="8"
              style={{
                filter: "drop-shadow(0 0 10px rgba(0, 255, 0, 0.8))",
              }}
            />
            {comp.shapes &&
              comp.shapes.map((shape, index) => {
                switch (shape.type) {
                  case "circle":
                    return (
                      <circle
                        key={index}
                        cx={shape.x}
                        cy={shape.y}
                        r={shape.radius}
                        fill={shape.filled ? "#00ff00" : "none"}
                        stroke="#00ff00"
                        strokeWidth="1"
                      />
                    );
                  case "panel":
                    return (
                      <line
                        key={index}
                        x1={shape.x1}
                        y1={shape.y1}
                        x2={shape.x2}
                        y2={shape.y2}
                        stroke="#00ff00"
                        strokeWidth="1"
                      />
                    );
                  case "pixel":
                    return (
                      <rect
                        key={index}
                        x={shape.x}
                        y={shape.y}
                        width="1"
                        height="1"
                        fill="#00ff00"
                      />
                    );
                  case "rectangle":
                    return (
                      <rect
                        key={index}
                        x={shape.x}
                        y={shape.y}
                        width={shape.length}
                        height={shape.breadth}
                        rx={shape.radius}
                        ry={shape.radius}
                        fill={shape.filled ? "#00ff00" : "none"}
                        stroke="#00ff00"
                        strokeWidth="1"
                      />
                    );
                  default:
                    return null;
                }
              })}
            {comp.displayText && (
              <text
                x="64"
                y="32"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#00ff00"
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontWeight: "bold",
                  filter: "drop-shadow(0 0 5px rgba(0, 255, 0, 0.7))",
                }}
              >
                {comp.displayText}
              </text>
            )}
          </motion.svg>
        );

      case "sensor":
        if (comp.state === "on") {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "65px",
                height: "65px",
                backgroundColor: "#00f",
                borderRadius: "13px",
              }}
            />
          );
        }
        break;

      case "joystick":
        return (
          <motion.div
            style={{
              position: "absolute",
              top: "50%",
              left: "49%",
              transform: "translate(-50%, -50%)",
              width: "80px",
              height: "80px",
              backgroundColor: comp.state === "active" ? "#4CAF50" : "#ccc",
              borderRadius: "50%",
              boxShadow:
                comp.state === "active"
                  ? "0 4px 10px rgba(0, 255, 0, 0.6)"
                  : "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "#FF6347",
                borderRadius: "50%",
                position: "absolute",
                top: comp.yValue ? 6 + (comp.yValue / 1023) * 50 : 30,
                left: comp.xValue ? 6 + (comp.xValue / 1023) * 50 : 30,
                transition: "all 0.1s ease",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.5)",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "5px solid rgba(0, 255, 0, 0.6)",
                opacity: "0.2",
              }}
            />
          </motion.div>
        );

      case "object":
        return (
          <motion.div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "65px",
              height: "65px",
              backgroundColor: "#555",
              borderRadius: "13px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        );

      default:
        return null;
    }
  };

  if (!Array.isArray(components)) {
    console.error("Components is not an array:", components);
    return <div>No components available</div>;
  }
  if (!Array.isArray(wires)) {
    console.error("Wires is not an array:", wires);
    return <div>No wires available</div>;
  }

  return (
    <div
      ref={(node) => {
        drop(node);
        workspaceRef.current = node;
      }}
      style={{
        flex: 1,
        position: "relative",
        height: "100%",
        background: "#ffffff",
        borderRadius: "12px",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#e0f0ff"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Main wire paths (behind components) */}
      {wiresToRender.map((wire, index) => {
        const sourceComponent = components.find((c) => c.id === wire.sourceId);
        const targetComponent = components.find((c) => c.id === wire.targetId);
        const sourcePin = sourceComponent?.pins.find(
          (p) => normalizePin(p.name) === normalizePin(wire.sourcePin)
        );
        const targetPin = targetComponent?.pins.find(
          (p) => normalizePin(p.name) === normalizePin(wire.targetPin)
        );
        if (!sourceComponent || !targetComponent || !sourcePin || !targetPin)
          return null;

        const sourcePos = getPinPosition(sourceComponent, wire.sourcePin);
        const targetPos = getPinPosition(targetComponent, wire.targetPin);

        const { mainPath } = getWirePath(
          { x: sourcePos.x, y: sourcePos.y },
          { x: targetPos.x, y: targetPos.y },
          sourcePin,
          targetPin,
          sourceComponent,
          targetComponent
        );

        return (
          <svg
            key={`wire-main-${wire.id || index}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 0, // Behind components
            }}
          >
            <path
              d={mainPath}
              stroke="#2196f3"
              strokeWidth="3"
              fill="transparent"
              style={{
                filter: "drop-shadow(0 0 3px rgba(33, 150, 243, 0.5))",
              }}
            />
            <g>
              <circle
                cx={(sourcePos.x + targetPos.x) / 2}
                cy={(sourcePos.y + targetPos.y) / 2}
                r="10.4"
                fill="red"
                style={{ cursor: "pointer", pointerEvents: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveWire(
                    wire.sourceId,
                    wire.sourcePin,
                    wire.targetId,
                    wire.targetPin
                  );
                }}
              />
              <text
                x={(sourcePos.x + targetPos.x) / 2}
                y={(sourcePos.y + targetPos.y) / 2 + 6.5}
                textAnchor="middle"
                fill="white"
                style={{
                  fontSize: "0.78rem",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                X
              </text>
            </g>
          </svg>
        );
      })}

      {/* Dragging wire main path (behind components) */}
      {draggingWire && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0, // Behind components
          }}
        >
          <path
            d={getDraggingWirePath(
              { x: draggingWire.x1, y: draggingWire.y1 },
              { x: draggingWire.x2, y: draggingWire.y2 }
            ).mainPath}
            stroke="#2196f3"
            strokeWidth="3"
            fill="transparent"
            style={{
              filter: "drop-shadow(0 0 3px rgba(33, 150, 243, 0.5))",
            }}
          />
        </svg>
      )}

      {/* Components */}
      {components.map((comp) => {
        const pins = pinConfigurations[comp.type] || { left: [], right: [] };
        const allPins = [...pins.left, ...pins.right];

        return (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "absolute",
              top: `${comp.y}px`,
              left: `${comp.x}px`,
              width: "286px",
              height: "260px",
              backgroundColor: "#ffffff",
              borderRadius: "15.6px",
              boxShadow: "0 5.2px 7.8px rgba(0, 0, 0, 0.1)",
              padding: "0px",
              cursor: "move",
              transition: "transform 0.2s, box-shadow 0.2s",
              border:
                selectedComponentId === comp.id
                  ? "2.6px solid blue"
                  : "1.3px solid gray",
              zIndex: 1, // Components above main wire paths
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10.4px 15.6px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => handleComponentClick(comp.id, e)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <img
              src={comp.image}
              alt={comp.name}
              style={{ width: "100%", height: "100%", borderRadius: "10.4px" }}
            />
            {renderComponentVisuals(comp)}
            {allPins.map((pin) => (
              <motion.div
                key={pin.name}
                style={{
                  position: "absolute",
                  top: `${pin.y}px`,
                  left: `${pin.x}px`,
                  width: "15.6px",
                  height: "15.6px",
                  borderRadius: "50%",
                  backgroundColor: pin.name.startsWith("C") ? "#2196f3" : "#f44336",
                  border: "2.6px solid #fff",
                  boxShadow: "0 2.6px 5.2px rgba(0, 0, 0, 0.2)",
                  cursor: "pointer",
                  transition: "background-color 0.2s, transform 0.2s",
                  pointerEvents: isMounted ? "auto" : "none",
                }}
                onMouseDown={(e) => handleStartWire(comp.id, pin.name, e)}
                whileHover={{ scale: 1.2 }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-26px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    padding: "2.6px 6.5px",
                    borderRadius: "3.9px",
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                    display: "none",
                    pointerEvents: "none",
                  }}
                  className="pin-tooltip"
                >
                  {pin.name}
                </div>
              </motion.div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveComponent(comp.id);
              }}
              style={{
                position: "absolute",
                bottom: "10.4px",
                right: "10.4px",
                padding: "6.5px 13px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "6.5px",
                cursor: "pointer",
                fontSize: "1.04rem",
              }}
            >
              Remove
            </button>
          </motion.div>
        );
      })}

      {/* Pin connection segments and markers (in front of components) */}
      {wiresToRender.map((wire, index) => {
        const sourceComponent = components.find((c) => c.id === wire.sourceId);
        const targetComponent = components.find((c) => c.id === wire.targetId);
        const sourcePin = sourceComponent?.pins.find(
          (p) => normalizePin(p.name) === normalizePin(wire.sourcePin)
        );
        const targetPin = targetComponent?.pins.find(
          (p) => normalizePin(p.name) === normalizePin(wire.targetPin)
        );
        if (!sourceComponent || !targetComponent || !sourcePin || !targetPin)
          return null;

        const sourcePos = getPinPosition(sourceComponent, wire.sourcePin);
        const targetPos = getPinPosition(targetComponent, wire.targetPin);

        const { sourceSegment, targetSegment } = getWirePath(
          { x: sourcePos.x, y: sourcePos.y },
          { x: targetPos.x, y: targetPos.y },
          sourcePin,
          targetPin,
          sourceComponent,
          targetComponent
        );

        return (
          <svg
            key={`wire-segments-${wire.id || index}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2, // Above components
            }}
          >
            {/* Source segment */}
            <path
              d={sourceSegment}
              stroke="#2196f3"
              strokeWidth="5"
              fill="transparent"
              style={{
                filter: "drop-shadow(0 0 5px rgba(100, 181, 246, 0.8))",
              }}
            />
            {/* Source marker */}
            <circle
              cx={sourcePos.x}
              cy={sourcePos.y}
              r="5"
              fill="#2196f3"
              stroke="#ffffff"
              strokeWidth="1.5"
              style={{
                filter: "drop-shadow(0 0 3px rgba(100, 181, 246, 0.8))",
              }}
            />
            {/* Target segment */}
            <path
              d={targetSegment}
              stroke="#2196f3"
              strokeWidth="5"
              fill="transparent"
              style={{
                filter: "drop-shadow(0 0 5px rgba(100, 181, 246, 0.8))",
              }}
            />
            {/* Target marker */}
            <circle
              cx={targetPos.x}
              cy={targetPos.y}
              r="5"
              fill="#2196f3"
              stroke="#ffffff"
              strokeWidth="1.5"
              style={{
                filter: "drop-shadow(0 0 3px rgba(100, 181, 246, 0.8))",
              }}
            />
          </svg>
        );
      })}

      {/* Dragging wire source segment and marker (in front of components) */}
      {draggingWire && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2, // Above components
          }}
        >
          <path
            d={getDraggingWirePath(
              { x: draggingWire.x1, y: draggingWire.y1 },
              { x: draggingWire.x2, y: draggingWire.y2 }
            ).sourceSegment}
            stroke="#2196f3"
            strokeWidth="5"
            fill="transparent"
            style={{
              filter: "drop-shadow(0 0 5px rgba(100, 181, 246, 0.8))",
            }}
          />
          <circle
            cx={draggingWire.x1}
            cy={draggingWire.y1}
            r="5"
            fill="#2196f3"
            stroke="#ffffff"
            strokeWidth="1.5"
            style={{
              filter: "drop-shadow(0 0 3px rgba(100, 181, 246, 0.8))",
            }}
          />
        </svg>
      )}

      <style jsx>{`
        .pin-tooltip {
          display: none;
        }
        motion.div:hover .pin-tooltip {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default Workspace;
