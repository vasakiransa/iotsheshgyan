import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { motion, useAnimation } from "framer-motion";

// Pin configurations with 30% increased size
const pinConfigurations = {
  bridge: {
    left: Array.from({ length: 12 }, (_, i) => ({
      name: `C${String(i + 1).padStart(3, "0")}`, // Blue pins (e.g., C011)
      x: 0,
      y: i * 22.93, // Evenly spaced from y=0 to y=252.23
    })),
    right: Array.from({ length: 12 }, (_, i) => ({
      name: `right-${i + 1}`, // Red pins
      x: 130 * 2, // Scaled width
      y: i * 22.93, // Evenly spaced from y=0 to y=252.23
    })),
  },
  led: {
    left: [
      { name: "left-1", x: 0, y: 65 * 2 },
    ],
    right: [
      { name: "C-right-1", x: 130 * 2, y: 65 * 2 },
    ],
  },
  sevensegment: {
    left: [
      { name: "left-1", x: 0, y: 65 * 2 },
    ],
    right: Array.from({ length: 4 }, (_, i) => ({
      name: `C-right-${i + 1}`,
      x: 130 * 2,
      y: (43 + i * 29.4) * 1.5, // Increased spacing for blue pins
    })),
  },
  oled: {
    left: [
      { name: "left-1", x: 0, y: 65 * 2 },
    ],
    right: [
      { name: "C-right-1", x: 130 * 2, y: 65 * 2 },
    ],
  },
  sensor: {
    left: [
      { name: "left-1", x: 0, y: 65 * 2 },
    ],
    right: [
      { name: "C-right-1", x: 130 * 2, y: 65 * 2 },
    ],
  },
  buzzer: {
    left: [
      { name: "left-1", x: 0, y: 65 * 2 },
    ],
    right: [
      { name: "C-right-1", x: 130 * 2, y: 65 * 2 },
    ],
  },
  motor: {
    left: [
      { name: "left-1", x: 0, y: 65 * 2 },
    ],
    right: Array.from({ length: 3 }, (_, i) => ({
      name: `C-right-${i + 1}`,
      x: 130 * 2,
      y: (70 + i * 26) * 1.3, // Start lower at y=70 (scaled)
    })),
  },
  pantilt: {
    left: [
      { name: "C-left-1", x: 0, y: 65 * 2 },
    ],
    right: [
      { name: "right-1", x: 130 * 2, y: 65 * 2 },
    ],
  },
  joystick: {
    left: [
      { name: "left-1", x: 0, y: 65 * 2 },
    ],
    right: Array.from({ length: 2 }, (_, i) => ({
      name: `C-right-${i + 1}`,
      x: 130 * 2,
      y: (70 + i * 39) * 1.3, // Start lower at y=70 (scaled)
    })),
  },
  audioplayer: {
    left: [{ name: "left-1", x: 0, y: 65 * 2 }],
    right: [{ name: "right-1", x: 130 * 2, y: 65 * 2 }],
  },
  ldr: {
    left: [{ name: "left-1", x: 0, y: 65 * 2 }],
    right: [{ name: "right-1", x: 130 * 2, y: 65 * 2 }],
  },
};

// Normalize pin names to ensure consistency (e.g., C11 -> C011)
const normalizePin = (pin) => {
  if (!pin) return pin;
  return pin.replace(/^C(\d{1,2})$/, (match, num) => `C${num.padStart(3, "0")}`);
};

const Workspace = ({ components, setComponents, wires, setWires }) => {
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

      setComponents((prev) => [
        ...prev,
        {
          id: `${id}-${Date.now()}`,
          name,
          type, // Use original type (e.g., "led" instead of "rgb-led")
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
          r: type === "led" ? 0 : undefined,
          g: type === "led" ? 0 : undefined,
          b: type === "led" ? 0 : undefined,
        },
      ]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  useEffect(() => {
    setIsMounted(true);
    setDraggingWire(null);
  }, []);

  const getPinPosition = (component, pinName) => {
    const pin = (component.pins || []).find((p) => p.name === pinName);
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
        if (distance < 19.5) {
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

      // Update connectedPins and RGB values if connected to C011
      setComponents((prev) =>
        prev.map((comp) => {
          if (comp.id === targetId) {
            const isC011 = normalizedSourcePin === "C011" || normalizedTargetPin === "C011";
            return {
              ...comp,
              connectedPins: [...(comp.connectedPins || []), normalizedTargetPin],
              ...(comp.type === "led" && isC011 ? { r: 1, g: 1, b: 1, state: "glowing" } : {}),
            };
          }
          if (comp.id === draggingWire.sourceId) {
            const isC011 = normalizedSourcePin === "C011" || normalizedTargetPin === "C011";
            return {
              ...comp,
              connectedPins: [...(comp.connectedPins || []), normalizedSourcePin],
              ...(comp.type === "led" && isC011 ? { r: 1, g: 1, b: 1, state: "glowing" } : {}),
            };
          }
          return comp;
        })
      );

      console.log(
        `Wire created: ${sourceComponent.type}:${normalizedSourcePin} -> ${targetComponent.type}:${normalizedTargetPin}`
      );
      console.log(`New wire:`, newWire);
      console.log(`Components state:`, components);
      console.log(`Wires state:`, wires);
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
          !(wire.sourceId === sourceId &&
            wire.sourcePin === normalizedSourcePin &&
            wire.targetId === targetId &&
            wire.targetPin === normalizedTargetPin)
      )
    );
    setComponents((prev) =>
      prev.map((comp) => {
        if (comp.id === sourceId) {
          return {
            ...comp,
            connectedPins: (comp.connectedPins || []).filter((p) => p !== normalizedSourcePin),
            ...(comp.type === "led" && normalizedSourcePin === "C011"
              ? { r: 0, g: 0, b: 0, state: null }
              : {}),
          };
        }
        if (comp.id === targetId) {
          return {
            ...comp,
            connectedPins: (comp.connectedPins || []).filter((p) => p !== normalizedTargetPin),
            ...(comp.type === "led" && normalizedTargetPin === "C011"
              ? { r: 0, g: 0, b: 0, state: null }
              : {}),
          };
        }
        return comp;
      })
    );
    console.log(`Removed wire: ${sourceId}:${normalizedSourcePin} -> ${targetId}:${normalizedTargetPin}`);
  };

  const getBezierCurve = (source, target) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const controlOffset = Math.min(Math.abs(dx) * 0.3, Math.abs(dy) * 0.3, 65);
    const controlPoint1 = { x: source.x + controlOffset, y: source.y };
    const controlPoint2 = { x: target.x - controlOffset, y: target.y };
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
      r: comp.r,
      g: comp.g,
      b: comp.b,
    });

    switch (comp.type) {
      case "led":
        if (
          comp.r !== undefined &&
          comp.g !== undefined &&
          comp.b !== undefined &&
          (comp.r > 0 || comp.g > 0 || comp.b > 0)
        ) {
          console.log(`Rendering glowing RGB LED with RGB(${comp.r}, ${comp.g}, ${comp.b})`);
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "65px",
                height: "65px",
                backgroundColor: `rgb(${comp.r}, ${comp.g}, ${comp.b})`,
                borderRadius: "50%",
                boxShadow: `0 0 20px rgba(${comp.r}, ${comp.g}, ${comp.b}, 0.7)`,
              }}
            />
          );
        }
        console.log(`Rendering off RGB LED`);
        return (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "65px",
              height: "65px",
              backgroundColor: "#ccc",
              borderRadius: "50%",
            }}
          />
        );
      case "sevensegment":
        if (comp.state === "displaying" && comp.value !== undefined) {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "52px",
                fontFamily: "monospace",
                textAlign: "center",
                color: "#f00",
                backgroundColor: "#000",
                width: "65px",
                height: "91px",
                lineHeight: "91px",
                borderRadius: "5.2px",
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
                fontSize: "18.2px",
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
                fontSize: "18.2px",
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
        if (comp.state === "moving" && comp.angle) {
          return (
            <motion.svg
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              width="130"
              height="130"
              viewBox="0 0 130 130"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.g
                animate={{ rotate: comp.angle.pan }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                transform-origin="65 65"
              >
                <motion.rect
                  x="58.5"
                  y="26"
                  width="13"
                  height="39"
                  fill="#0288d1"
                  animate={{ rotate: comp.angle.tilt }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  transform-origin="65 65"
                />
                <circle cx="65" cy="65" r="6.5" fill="#333" />
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
              width: "65px",
              height: "65px",
              backgroundColor: comp.state === "spinning" ? "#666" : "#ccc",
              borderRadius: "50%",
            }}
          >
            <div
              style={{
                width: "13px",
                height: "39px",
                backgroundColor: "#fff",
                position: "absolute",
                top: "13px",
                left: "26px",
              }}
            />
          </motion.div>
        );
      case "oled":
        if (comp.state === "displaying" && comp.displayText) {
          return (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "18.2px",
                fontFamily: "monospace",
                textAlign: "center",
                color: "#0f0",
                backgroundColor: "#000",
                width: "104px",
                height: "78px",
                lineHeight: "78px",
                borderRadius: "5.2px",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                padding: "0 6.5px",
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
                width: "65px",
                height: "65px",
                backgroundColor: "#00f",
                borderRadius: "13px",
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
                fontSize: "18.2px",
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
                width: "52px",
                height: "52px",
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
                width: "39px",
                height: "39px",
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
        background: "#ffffff", // White background
        borderRadius: "12px",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      {/* Grid Background */}
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
              stroke="#e0f0ff" // Light blue grid lines
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

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
                selectedComponentId === comp.id ? "2.6px solid blue" : "1.3px solid gray",
              zIndex: 1, // Ensure components are above the grid
            }}
            whileHover={{ scale: 1.05, boxShadow: "0 10.4px 15.6px rgba(0, 0, 0, 0.2)" }}
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
      {wiresToRender.map((wire, index) => {
        const sourcePos = getPinPosition(
          components.find((c) => c.id === wire.sourceId),
          wire.sourcePin
        );
        const targetPos = getPinPosition(
          components.find((c) => c.id === wire.targetId),
          wire.targetPin
        );
        return (
          <svg
            key={wire.id || index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 2, // Ensure wires are above the grid and components
            }}
          >
            <path
              d={getBezierCurve(
                { x: sourcePos.x, y: sourcePos.y },
                { x: targetPos.x, y: targetPos.y }
              )}
              stroke="black"
              strokeWidth="2.6"
              fill="transparent"
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
                  handleRemoveWire(wire.sourceId, wire.sourcePin, wire.targetId, wire.targetPin);
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
      {draggingWire && (
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <path
            d={getBezierCurve(
              { x: draggingWire.x1, y: draggingWire.y1 },
              { x: draggingWire.x2, y: draggingWire.y2 }
            )}
            stroke="blue"
            strokeWidth="2.6"
            fill="transparent"
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
