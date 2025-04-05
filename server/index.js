const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// Simulated state of components
let components = [];
let wires = [];

// WebSocket connection
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'init', components, wires }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'updateComponents':
        components = data.components;
        wires = data.wires;
        simulateComponents();
        broadcastState();
        break;
      case 'executeBlock':
        executeBlock(data.block);
        break;
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

// Broadcast state to all connected clients
function broadcastState() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'state', components, wires }));
    }
  });
}

// Simulate component interactions based on wiring
function simulateComponents() {
  components.forEach((comp) => {
    const connectedWires = wires.filter(
      (wire) => wire.sourceId === comp.id || wire.targetId === comp.id
    );
    switch (comp.type) {
      case 'smartlightled':
        comp.state = { color: '#000000' }; // Default off
        break;
      case 'led': // Tri-Color LED
        comp.state = { r: 0, g: 0, b: 0 };
        break;
      case 'buzzer':
        comp.state = { frequency: 0, duration: 0, playing: false };
        break;
      case 'sevensegmentdisplay':
        comp.state = { value: '' };
        break;
    }
  });
}

// Execute Blockly-like block functionality
function executeBlock(block) {
  const targetComponent = components.find((c) => c.id === block.componentId);
  if (!targetComponent) return;

  switch (targetComponent.type) {
    case 'smartlightled':
      if (block.function === 'vibgyor') {
        targetComponent.state.color = getVibgyorColor();
      }
      break;
    case 'led': // Tri-Color LED
      if (block.function === 'rgbIntensity') {
        targetComponent.state = { r: block.r, g: block.g, b: block.b };
      } else if (block.function === 'colorPicker') {
        targetComponent.state = hexToRgb(block.color);
      } else if (block.function === 'namedColor') {
        targetComponent.state = hexToRgb(getNamedColor(block.name));
        targetComponent.state.on = block.switch === 'on';
      }
      break;
    case 'buzzer':
      if (block.function === 'setFrequency') {
        targetComponent.state = {
          frequency: block.frequency,
          duration: block.duration,
          playing: true,
        };
        setTimeout(() => {
          targetComponent.state.playing = false;
          broadcastState();
        }, block.duration * 1000);
      } else if (block.function === 'musicPlayer') {
        playMusic(targetComponent, block.tune);
      }
      break;
    case 'sevensegmentdisplay':
      if (block.function === 'ledControl') {
        targetComponent.state.value = block.leds.join('');
      } else if (block.function === 'numbers') {
        targetComponent.state.value = block.number.toString();
      } else if (block.function === 'letters') {
        targetComponent.state.value = block.letter;
      }
      break;
  }
  broadcastState();
}

// Helper functions
function getVibgyorColor() {
  const colors = ['#FF0000', '#FFA500', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#EE82EE'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function getNamedColor(name) {
  const colors = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    yellow: '#FFFF00',
  };
  return colors[name] || '#000000';
}

function playMusic(component, tune) {
  const tunes = {
    'saregama': [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
    'happybirthday': [261.63, 261.63, 293.66, 261.63, 349.23, 329.63],
  };
  const sequence = tunes[tune] || [];
  let index = 0;
  const playNext = () => {
    if (index >= sequence.length) {
      component.state.playing = false;
      broadcastState();
      return;
    }
    component.state = { frequency: sequence[index], duration: 0.5, playing: true };
    broadcastState();
    index++;
    setTimeout(playNext, 500);
  };
  playNext();
}

// API Endpoints
app.post('/update', (req, res) => {
  components = req.body.components;
  wires = req.body.wires;
  simulateComponents();
  broadcastState();
  res.send({ status: 'success' });
});

app.post('/execute', (req, res) => {
  executeBlock(req.body);
  res.send({ status: 'success' });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});