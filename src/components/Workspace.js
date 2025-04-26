import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { motion, useAnimation } from "framer-motion";

// Pin configurations updated to match requirements
const pinConfigurations = {
  bridge: {
    left: Array.from({ length: 12 }, (_, i) => ({
      name: `C${String(i + 1).padStart(2, "0")}`, // Blue pins (starts with "C")
      x: 0,
      y: (10 + i * 15) * 1, // Adjusted spacing for 12 pins in 200px height
    })),
    right: Array.from({ length: 12 }, (_, i) => ({
      name: `right-${i + 1}`, // Red pins (does not start with "C")
      x: 100 * 2,
      y: (10 + i * 15) * 1, // Adjusted spacing
    })),
  },
  led: { // Tri-colour LED
    left: [
      { name: "left-1", x: 0, y: 50 * 2 }, // Red pin (does not start with "C")
    ],
    right: [
      { name: "C-right-1", x: 100 * 2, y: 50 * 2 }, // Blue pin (starts with "C")
    ],
  },
  sevensegment: { // Seven Segment Display
    left: [
      { name: "left-1", x: 0, y: 50 * 2 }, // Red pin
    ],
    right: Array.from({ length: 4 }, (_, i) => ({
      name: `C-right-${i + 1}`, // Blue pins
      x: 100 * 2,
      y: (40 + i * 15) * 1, // Spaced out over right side
    })),
  },
  oled: {
    left: [
      { name: "left-1", x: 0, y: 50 * 2 }, // Red pin
    ],
    right: [
      { name: "C-right-1", x: 100 * 2, y: 50 * 2 }, // Blue pin
    ],
  },
  sensor: { // Ultrasonic Sensor
    left: [
      { name: "left-1", x: 0, y: 50 * 2 }, // Red pin
    ],
    right: [
      { name: "C-right-1", x: 100 * 2, y: 50 * 2 }, // Blue pin
    ],
  },
  buzzer: {
    left: [
      { name: "left-1", x: 0, y: 50 * 2 }, // Red pin
    ],
    right: [
      { name: "C-right-1", x: 100 * 2, y: 50 * 2 }, // Blue pin
    ],
  },
  motor: { // DC Motor
    left: [
      { name: "left-1", x: 0, y: 50 * 2 }, // Red pin
    ],
    right: Array.from({ length: 3 }, (_, i) => ({
      name: `C-right-${i + 1}`, // Blue pins
      x: 100 * 2,
      y: (40 + i * 20) * 1, // Spaced out over right side
    })),
  },
  pantilt: {
    left: [
      { name: "C-left-1", x: 0, y: 50 * 2 }, // Blue pin
    ],
    right: [
      { name: "right-1", x: 100 * 2, y: 50 * 2 }, // Red pin
    ],
  },
  joystick: {
    left: [
      { name: "left-1", x: 0, y: 50 * 2 }, // Red pin
    ],
    right: Array.from({ length: 2 }, (_, i) => ({
      name: `C-right-${i + 1}`, // Blue pins
      x: 100 * 2,
      y: (40 + i * 30) * 1, // Spaced out over right side
    })),
  },
  // Other components not mentioned in requirements but present in original code
  audioplayer: {
    left: [{ name: "left-1", x: 0, y: 50 * 2 }],
    right: [{ name: "right-1", x: 100 * 2, y: 50 * 2 }],
  },
  ldr: {
    left: [{ name: "left-1", x: 0, y: 50 * 2 }],
    right: [{ name: "right-1", x: 100 * 2, y: 50 * 2 }],
  },
};

const Workspace = ({ components, setComponents, wires, setWires }) => {
  const [draggingWire, setDraggingWire] = useState(null);
  const workspaceRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const controls = useAnimation();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "component",
    drop: (item, monitor) => {
      const { id, name, type, image } = item;
      const pins = pinConfigurations[type] || { left: [], right: [] };
      const offset = monitor.getClientOffset();
      const workspaceRect = workspaceRef.current.getBoundingClientRect();

      setComponents((prev) => [
        ...prev,
        {
          id: `${id}-${Date.now()}`,
          name,
          type,
          image,
          x: offset.x - workspaceRect.left - 50,
          y: offset.y - workspaceRect.top - 50,
          pins: [...pins.left, ...pins.right],
          pin: null,
          state: null,
          value: type === "sevensegment" ? 0 : null,
          angle: type === "pantilt" ? { pan: 0, tilt: 0 } : null,
          speed: type === "motor" ? 0 : null,
          direction: type === "motor" ? "forward" : null,
          displayText: type === "oled" ? "" : null,
        },
      ]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const getPinPosition = (component, pinName) => {
    const pin = (component.pins || []).find((p) => p.name === pinName);
    if (!pin) {
      console.warn(`Pin ${pinName} not found on component ${component.id}`);
      return { x: component.x, y: component.y };
    }
    return { x: component.x + pin.x, y: component.y + pin.y };
  };

  const handleStartWire = (componentId, pinName, event) => {
    event.stopPropagation();
    if (
      wires.some((wire) => wire.sourceId === componentId && wire.sourcePin === pinName) ||
      wires.some((wire) => wire.targetId === componentId && wire.targetPin === pinName)
    ) {
      return;
    }

    const sourceComponent = components.find((comp) => comp.id === componentId);
    if (!sourceComponent) return;
    const pinPosition = getPinPosition(sourceComponent, pinName);
    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    setDraggingWire({
      sourceId: componentId,
      sourcePin: pinName,
      x1: pinPosition.x,
      y1: pinPosition.y,
      x2: event.clientX - workspaceRect.left,
      y2: event.clientY - workspaceRect.top,
    });
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

  const findOverlappingPin = (x, y, excludePin = null, excludeComponentId = null) => {
    for (const component of components || []) {
      if (component.id === excludeComponentId) continue;
      for (const pin of component.pins || []) {
        if (pin.name === excludePin) continue;
        const pinPos = getPinPosition(component, pin.name);
        const distance = Math.sqrt((pinPos.x - x) ** 2 + (pinPos.y - y) ** 2);
        if (distance < 15) {
          return { componentId: component.id, pin: pin.name };
        }
      }
    }
    return null;
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
        wires.some((wire) => wire.sourceId === targetId && wire.sourcePin === targetPin) ||
        wires.some((wire) => wire.targetId === targetId && wire.targetPin === targetPin)
      ) {
        setDraggingWire(null);
        return;
      }

      const targetComponent = components.find((c) => c.id === targetId);
      const sourceComponent = components.find((c) => c.id === draggingWire.sourceId);
      if (!targetComponent || !sourceComponent) return;

      const targetPinPosition = getPinPosition(targetComponent, targetPin);
      const sourcePinPosition = getPinPosition(sourceComponent, draggingWire.sourcePin);

      setWires((prev) => [
        ...prev,
        {
          id: `${draggingWire.sourceId}-${targetId}-${Date.now()}`,
          sourceId: draggingWire.sourceId,
          sourcePin: draggingWire.sourcePin,
          targetId: targetId,
          targetPin: targetPin,
          x1: sourcePinPosition.x,
          y1: sourcePinPosition.y,
          x2: targetPinPosition.x,
          y2: targetPinPosition.y,
        },
      ]);

      setComponents((prev) =>
        prev.map((comp) => {
          if (comp.id === targetId) {
            return { ...comp, pin: targetPin };
          }
          if (comp.id === draggingWire.sourceId) {
            return { ...comp, pin: draggingWire.sourcePin };
          }
          return comp;
        })
      );
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

  const getBezierCurve = (source, target) => {
    const controlPoint1 = { x: source.x + 50, y: source.y };
    const controlPoint2 = { x: target.x - 50, y: target.y };
    return `M${source.x},${source.y} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${target.x},${target.y}`;
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
        if (
          wire.sourceId === selectedComponentId ||
          wire.targetId === selectedComponentId
        ) {
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

  const handleRemoveWire = (sourceId, sourcePin, targetId, targetPin) => {
    setWires((prevWires) =>
      prevWires.filter(
        (wire) =>
          wire.sourceId !== sourceId ||
          wire.sourcePin !== sourcePin ||
          wire.targetId !== targetId ||
          wire.targetPin !== targetPin
      )
    );
    setComponents((prev) =>
      prev.map((comp) => {
        if (
          (comp.id === sourceId && comp.pin === sourcePin) ||
          (comp.id === targetId && comp.pin === targetPin)
        ) {
          return { ...comp, pin: null };
        }
        return comp;
      })
    );
  };

  // Motor spinning animation
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

  // Helper to render component-specific visuals
  const renderComponentVisuals = (comp) => {
    switch (comp.type) {
      case "led":
        if (
          comp.r !== undefined &&
          comp.g !== undefined &&
          comp.b !== undefined &&
          (comp.r > 0 || comp.g > 0 || comp.b > 0)
        ) {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "50px",
                height: "50px",
                backgroundColor: `rgb(${comp.r}, ${comp.g}, ${comp.b})`,
                borderRadius: "50%",
              }}
            />
          );
        } else if (comp.color && comp.on !== undefined) {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "50px",
                height: "50px",
                backgroundColor: comp.on ? comp.color : "#ccc",
                borderRadius: "50%",
              }}
            />
          );
        } else {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "50px",
                height: "50px",
                backgroundColor: "#ccc",
                borderRadius: "50%",
              }}
            />
          );
        }
      case "smartlight":
        if (comp.state === "vibgyor") {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "50px",
                height: "50px",
                background:
                  "linear-gradient(90deg, violet, indigo, blue, green, yellow, orange, red)",
                borderRadius: "50%",
              }}
            />
          );
        }
        break;
      case "sevensegment":
        console.log(`SevenSegment ${comp.id}: state=${comp.state}, value=${comp.value}`);
        if (comp.state === "displaying" && comp.value !== undefined) {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "40px",
                fontFamily: "monospace",
                textAlign: "center",
                color: "#f00",
                backgroundColor: "#000",
                width: "50px",
                height: "70px",
                lineHeight: "70px",
                borderRadius: "4px",
              }}
            >
              {comp.value}
            </div>
          );
        }
        break;
      case "buzzer":
        if (comp.freq && comp.duration) {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "14px",
                textAlign: "center",
                color: "#333",
              }}
            >
              {comp.freq}Hz, {comp.duration}s
            </div>
          );
        } else if (comp.song) {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "14px",
                textAlign: "center",
                color: "#333",
              }}
            >
              Playing: {comp.song}
            </div>
          );
        }
        break;
      case "pantilt":
        console.log(`PanTilt ${comp.id}: state=${comp.state}, angle=${JSON.stringify(comp.angle)}`);
        if (comp.state === "moving" && comp.angle) {
          return (
            <motion.svg
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              width="100"
              height="100"
              viewBox="0 0 100 100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.g
                animate={{ rotate: comp.angle.pan }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                transform-origin="50 50"
              >
                <motion.rect
                  x="45"
                  y="20"
                  width="10"
                  height="30"
                  fill="#0288d1"
                  animate={{ rotate: comp.angle.tilt }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  transform-origin="50 50"
                />
                <circle cx="50" cy="50" r="5" fill="#333" />
              </motion.g>
            </motion.svg>
          );
        }
        break;
      case "motor":
        return (
          <motion.div
            animate={controls}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "50px",
              height: "50px",
              backgroundColor: comp.state === "spinning" ? "#666" : "#ccc",
              borderRadius: "50%",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "30px",
                backgroundColor: "#fff",
                position: "absolute",
                top: "10px",
                left: "20px",
              }}
            />
          </motion.div>
        );
      case "oled":
        console.log(`OLED ${comp.id}: state=${comp.state}, displayText=${comp.displayText}`);
        if (comp.state === "displaying" && comp.displayText) {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "14px",
                fontFamily: "monospace",
                textAlign: "center",
                color: "#0f0",
                backgroundColor: "#000",
                width: "80px",
                height: "60px",
                lineHeight: "60px",
                borderRadius: "4px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                padding: "0 5px",
              }}
            >
              {comp.displayText}
            </div>
          );
        }
        break;
      case "sensor":
        if (comp.state === "on") {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "50px",
                height: "50px",
                backgroundColor: "#00f",
                borderRadius: "10px",
              }}
            />
          );
        }
        break;
      case "audioplayer":
        if (comp.state === "playing") {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "14px",
                textAlign: "center",
                color: "#333",
              }}
            >
              Playing Audio
            </div>
          );
        }
        break;
      case "joystick":
        if (comp.state === "active") {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "40px",
                height: "40px",
                backgroundColor: "#888",
                borderRadius: "50%",
              }}
            />
          );
        }
        break;
      case "ldr":
        if (comp.state === "active") {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "30px",
                height: "30px",
                backgroundColor: "#ffa500",
                borderRadius: "50%",
              }}
            />
          );
        }
        break;
      default:
        return null;
    }
  };

  // Defensive check for components and wires
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
      onMouseMove={handleMoveWire}
      onMouseUp={handleEndWire}
      style={{
        flex: 1,
        position: "relative",
        border: "1px dashed #ccc",
        height: "100%",
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        borderRadius: "12px",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Render components */}
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
              width: "220px",
              height: "200px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              padding: "0px",
              cursor: "move",
              transition: "transform 0.2s, box-shadow 0.2s",
              border:
                selectedComponentId === comp.id ? "2px solid blue" : "1px solid gray",
            }}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 12px rgba(0, 0, 0, 0.2)" }}
            onClick={(e) => handleComponentClick(comp.id, e)}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            <img
              src={comp.image}
              alt={comp.name}
              style={{ width: "100%", height: "100%", borderRadius: "8px" }}
            />
            {renderComponentVisuals(comp)}
            {/* Render Pins */}
            {allPins.map((pin) => (
              <motion.div
                key={pin.name}
                style={{
                  position: "absolute",
                  top: `${pin.y}px`,
                  left: `${pin.x}px`,
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: pin.name.startsWith("C") ? "#2196f3" : "#f44336",
                  border: "2px solid #fff",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                  cursor: "pointer",
                  transition: "background-color 0.2s, transform 0.2s",
                }}
                onMouseDown={(e) => handleStartWire(comp.id, pin.name, e)}
                whileHover={{ scale: 1.2 }}
              >
                {/* Optional: Display pin name on hover */}
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    color: "white",
                    padding: "2px 5px",
                    borderRadius: "3px",
                    fontSize: "10px",
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
                bottom: "8px",
                right: "8px",
                padding: "5px 10px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
            >
              Remove
            </button>
          </motion.div>
        );
      })}
      {/* Render permanent wires (Bezier curves) */}
      {wiresToRender.map((wire, index) => (
        <svg
          key={wire.id || index}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <path
            d={getBezierCurve(
              { x: wire.x1, y: wire.y1 },
              { x: wire.x2, y: wire.y2 }
            )}
            stroke="black"
            strokeWidth="2"
            fill="transparent"
          />
          <g>
            <circle
              cx={(wire.x1 + wire.x2) / 2}
              cy={(wire.y1 + wire.y2) / 2}
              r="8"
              fill="red"
              style={{ cursor: "pointer", pointerEvents: "auto" }}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveWire(wire.sourceId, wire.sourcePin, wire.targetId, wire.targetPin);
              }}
            />
            <text
              x={(wire.x1 + wire.x2) / 2}
              y={(wire.y1 + wire.y2) / 2 + 5}
              textAnchor="middle"
              fill="white"
              style={{
                fontSize: "0.6rem",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              X
            </text>
          </g>
        </svg>
      ))}
      {/* Render wire being dragged */}
      {draggingWire && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <path
            d={getBezierCurve(
              { x: draggingWire.x1, y: draggingWire.y1 },
              { x: draggingWire.x2, y: draggingWire.y2 }
            )}
            stroke="blue"
            strokeWidth="2"
            fill="transparent"
          />
        </svg>
      )}
      <style jsx>{`
        .pin-tooltip {
          display: none;
        }
        .pin-tooltip:hover {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default Workspace;
