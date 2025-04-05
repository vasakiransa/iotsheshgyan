import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Switch } from '@mui/material';
import ledImage from '../assets/led.png';
import PinConnection from './PinConnection';

const LED = ({ id, name, onPinChange }) => {
  const [status, setStatus] = useState(false);

  const toggleLED = () => {
    setStatus(!status);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ position: 'absolute', top: `${id * 100}px`, left: `${id * 100}px` }}
    >
      <Card sx={{ width: 250, backgroundColor: status ? '#fff3cd' : '#f5f5f5' }}>
        <CardContent>
          <img src={ledImage} alt="LED" style={{ width: '100%', height: 'auto' }} />
          <Typography variant="h6" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            LED ID: {id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Status: {status ? 'On' : 'Off'}
          </Typography>
          <Switch checked={status} onChange={toggleLED} color="primary" />
          <PinConnection componentId={id} onPinChange={onPinChange} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LED;