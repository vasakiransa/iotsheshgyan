import React, { useState, useRef, useEffect } from "react";
import { useDrop } from "react-dnd";
import { motion } from "framer-motion";

// Pin configurations remain unchanged
const pinConfigurations = {
    bridge: {
        left: Array.from({ length: 12 }, (_, i) => ({
            name: `C${String(i + 1).padStart(2, "0")}`, // C01 to C12
            x: 0,
            y: (10 + i * 8) * 2,
        })),
        right: Array.from({ length: 12 }, (_, i) => ({
            name: `right-${i + 1}`,
            x: 100 * 2,
            y: (10 + i * 8) * 2,
        })),
    },
    oled: {
        left: [{ name: "left-1", x: 0, y: 50 * 2 }],
        right: [{ name: "right-1", x: 100 * 2, y: 50 * 2 }],
    },
    audioplayer: {
        left: [{ name: "left-1", x: 0, y: 50 * 2 }],
        right: [{ name: "right-1", x: 100 * 2, y: 50 * 2 }],
    },
    led: {
        left: [
            { name: "C011", x: 0, y: 40 * 2 }, // Red
            { name: "C012", x: 0, y: 50 * 2 }, // Green
            { name: "C013", x: 0, y: 60 * 2 }, // Blue
        ],
        right: [{ name: "GND", x: 100 * 2, y: 50 * 2 }],
    },
    buzzer: {
        left: [{ name: "left-1", x: 0, y: 50 * 2 }],
        right: [{ name: "right-1", x: 100 * 2, y: 50 * 2 }],
    },
    motor: {
        left: [{ name: "left-1", x: 0, y: 50 * 2 }],
        right: [
            { name: "right-1", x: 100 * 2, y: 50 * 2 },
            { name: "right-2", x: 100 * 2, y: 60 * 2 },
            { name: "right-3", x: 100 * 2, y: 70 * 2 },
        ],
    },
    joystick: {
        left: [{ name: "left-1", x: 0, y: 40 * 2 }],
        right: [
            { name: "right-1", x: 100 * 2, y: 40 * 2 },
            { name: "right-2", x: 100 * 2, y: 60 * 2 },
        ],
    },
    smartlight: {
        left: [{ name: "left-1", x: 0, y: 60 * 2 }],
        right: [
            { name: "right-1", x: 100 * 2, y: 60 * 2 },
            { name: "right-2", x: 100 * 2, y: 78 * 2 },
        ],
    },
    sevensegment: {
        left: [{ name: "left-1", x: 0, y: 50 * 2 }],
        right: [
            { name: "right-1", x: 100 * 2, y: 50 * 2 },
            { name: "right-2", x: 100 * 2, y: 65 * 2 },
            { name: "right-3", x: 100 * 2, y: 80 * 2 },
            { name: "right-4", x: 100 * 2, y: 90 * 2 },
        ],
    },
    sensor: {
        left: [{ name: "left-1", x: 0, y: 50 * 2 }],
        right: [{ name: "right-1", x: 100 * 2, y: 50 * 2 }],
    },
    ldr: {
        left: [{ name: "left-1", x: 0, y: 50 * 2 }],
        right: [{ name: "right-1", x: 100 * 2, y: 50 * 2 }],
    },
    
    pantilt: {
        left: [{ name: "left-1", x: 0, y: 50 * 2 }],
        right: [
            { name: "right-1", x: 100 * 2, y: 50 * 2 },
            { name: "right-2", x: 100 * 2, y: 65 * 2 },
        ],
    },
};

const Workspace = ({ components, setComponents }) => {
    const [wires, setWires] = useState([]);
    const [draggingWire, setDraggingWire] = useState(null);
    const workspaceRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [selectedComponentId, setSelectedComponentId] = useState(null);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: "component",
        drop: (item) => handleDrop(item),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const handleDrop = (item) => {
        const { type } = item;
        const pins = pinConfigurations[type] || { left: [], right: [] };
        setComponents((prev) => [
            ...prev,
            {
                ...item,
                id: `${item.id}-${Date.now()}`,
                x: Math.random() * 500,
                y: Math.random() * 500,
                type,
                pins: [...pins.left, ...pins.right],
                pin: null, // Initialize pin as null
            },
        ]);
    };

    const getPinPosition = (component, pinName) => {
        const pin = component.pins.find((p) => p.name === pinName);
        if (!pin) return { x: 0, y: 0 };
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
        for (const component of components) {
            if (component.id === excludeComponentId) continue;
            for (const pin of component.pins) {
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

            // Update the pin property of the target component
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
        // Reset pin property when wire is removed
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

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, selectedComponentId, dragOffset, components]);

    // Helper to render component-specific visuals
    const renderComponentVisuals = (comp) => {
        switch (comp.type) {
            case "led":
                // Check if RGB values are set
                if (
                    comp.r !== undefined &&
                    comp.g !== undefined &&
                    comp.b !== undefined &&
                    (comp.r > 0 || comp.g > 0 || comp.b > 0)
                ) {
                    return (
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor: `rgb(${comp.r}, ${comp.g}, ${comp.b})`,
                                borderRadius: "50%",
                                margin: "0 auto",
                            }}
                        />
                    );
                } 
                // Check if color is set with on/off state
                else if (comp.color && comp.on !== undefined) {
                    return (
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor: comp.on ? comp.color : "#ccc",
                                borderRadius: "50%",
                                margin: "0 auto",
                            }}
                        />
                    );
                } 
                // Default to off state if no color or RGB is set
                else {
                    return (
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                backgroundColor: "#ccc",
                                borderRadius: "50%",
                                margin: "0 auto",
                            }}
                        />
                    );
                }
            case "smartlight":
                if (comp.state === "vibgyor") {
                    return (
                        <div
                            style={{
                                width: "50px",
                                height: "50px",
                                background: "linear-gradient(90deg, violet, indigo, blue, green, yellow, orange, red)",
                                borderRadius: "50%",
                                margin: "0 auto",
                            }}
                        />
                    );
                }
                break;
            case "sevensegment":
                if (comp.number !== undefined) {
                    return (
                        <div
                            style={{
                                fontSize: "40px",
                                fontFamily: "monospace",
                                textAlign: "center",
                                color: "#f00",
                                backgroundColor: "#000",
                                width: "50px",
                                height: "70px",
                                margin: "0 auto",
                                lineHeight: "70px",
                            }}
                        >
                            {comp.number}
                        </div>
                    );
                } else if (comp.letter) {
                    return (
                        <div
                            style={{
                                fontSize: "40px",
                                fontFamily: "monospace",
                                textAlign: "center",
                                color: "#f00",
                                backgroundColor: "#000",
                                width: "50px",
                                height: "70px",
                                margin: "0 auto",
                                lineHeight: "70px",
                            }}
                        >
                            {comp.letter}
                        </div>
                    );
                } else if (comp.leds) {
                    const { led1, led2, led3, led4, led5, led6, led7 } = comp.leds;
                    return (
                        <svg width="50" height="70" style={{ margin: "0 auto" }}>
                            <rect x="5" y="5" width="40" height="60" fill="#000" />
                            <line x1="10" y1="10" x2="40" y2="10" stroke={led1 === "true" ? "#f00" : "#333"} strokeWidth="4" />
                            <line x1="40" y1="10" x2="40" y2="30" stroke={led2 === "true" ? "#f00" : "#333"} strokeWidth="4" />
                            <line x1="40" y1="35" x2="40" y2="55" stroke={led3 === "true" ? "#f00" : "#333"} strokeWidth="4" />
                            <line x1="10" y1="60" x2="40" y2="60" stroke={led4 === "true" ? "#f00" : "#333"} strokeWidth="4" />
                            <line x1="10" y1="35" x2="10" y2="55" stroke={led5 === "true" ? "#f00" : "#333"} strokeWidth="4" />
                            <line x1="10" y1="10" x2="10" y2="30" stroke={led6 === "true" ? "#f00" : "#333"} strokeWidth="4" />
                            <line x1="10" y1="35" x2="40" y2="35" stroke={led7 === "true" ? "#f00" : "#333"} strokeWidth="4" />
                        </svg>
                    );
                }
                break;
            case "buzzer":
                if (comp.freq && comp.duration) {
                    return (
                        <div
                            style={{
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
            default:
                return null;
        }
    };

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
            {components.map((comp) => (
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
                        border: selectedComponentId === comp.id ? "2px solid blue" : "1px solid gray",
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
                    {comp.pins.map((pin) => (
                        <div
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
                        />
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
            ))}
            {/* Render permanent wires (Bezier curves) */}
            {wiresToRender.map((wire, index) => (
                <svg
                    key={index}
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
        </div>
    );
};

export default Workspace;