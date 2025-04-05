import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableComponent = ({ id, name, type, image, onAddComponent }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { id, name, type, image },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.9 : 1,
        width: '180px',
        padding: '16px',
        margin: '8px',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: isDragging
          ? '0 8px 16px rgba(0, 0, 0, 0.15)'
          : '0 4px 8px rgba(0, 0, 0, 0.1)',
        // Use transform GPU acceleration for smoother dragging
        transform: isDragging ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
        // Optimized transition for dragging
        transition: 'transform 0.15s ease-out, opacity 0.1s ease-out, box-shadow 0.2s ease-out',
        willChange: 'transform, opacity', // Hint to browser for optimization
        // Remove pseudo-class styles from inline style (use CSS instead if needed)
      }}
      onClick={() => onAddComponent(id, name, type, image)}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
          marginBottom: '10px',
          // Remove hover transition here to avoid interference with dragging
          transform: 'translateZ(0)', // GPU acceleration
        }}
      >
        <img
          src={image}
          alt={name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: 'translateZ(0)', // GPU acceleration
          }}
        />
      </div>

      <h4
        style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 600,
          color: '#333',
          textAlign: 'center',
          lineHeight: '1.2',
        }}
      >
        {name}
      </h4>
      <p
        style={{
          marginTop: '4px',
          fontSize: '0.8rem',
          color: '#777',
          textAlign: 'center',
        }}
      >
        {type}
      </p>

      <button
        style={{
          backgroundColor: '#5a67d8',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          width: '100%',
          padding: '8px',
          marginTop: '10px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: 500,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
          transition: 'background-color 0.2s ease-out, transform 0.15s ease-out',
          transform: 'translateZ(0)', // GPU acceleration
        }}
        onClick={(e) => {
          e.stopPropagation();
          onAddComponent(id, name, type, image);
        }}
      >
        Add +
      </button>
    </div>
  );
};

export default DraggableComponent;