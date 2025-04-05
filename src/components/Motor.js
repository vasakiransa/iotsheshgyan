import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Button } from '@mui/material';
import axios from 'axios';
import motorImage from '../assets/motor.png';
import PinConnection from './PinConnection';

const Motor = ({ id, name, onPinChange }) => {
  const [status, setStatus] = useState('Stopped');

  const handleControl = async (action) => {
    const response = await axios.post(`http://localhost:5000/api/motor/${id}/control`, { action });
    setStatus(response.data.status);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ position: 'absolute', top: `${id * 100}px`, left: `${id * 100}px` }}
    >
      <Card sx={{ width: 250, backgroundColor: '#ffd1dc' }}>
        <CardContent>
          <img src={motorImage} alt="Motor" style={{ width: '100%', height: 'auto' }} />
          <Typography variant="h6" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Motor ID: {id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {status}
          </Typography>
          <Button variant="contained" onClick={() => handleControl('start')} sx={{ mr: 1 }}>
            Start
          </Button>
          <Button variant="contained" color="error" onClick={() => handleControl('stop')}>
            Stop
          </Button>
          <PinConnection componentId={id} onPinChange={onPinChange} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Motor;