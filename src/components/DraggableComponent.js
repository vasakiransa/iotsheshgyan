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
        opacity: isDragging ? 0.8 : 1,
        width: '200px',
        padding: '20px',
        margin: '10px',
        background: 'linear-gradient(135deg, #ffffff, #f9f9f9)',
        border: '1px solid #e0e0e0',
        borderRadius: '16px',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: isDragging
          ? '0 10px 24px rgba(0, 0, 0, 0.15)'
          : '0 6px 12px rgba(0, 0, 0, 0.08)',
        transform: isDragging ? 'translateY(-5px) scale(1.05)' : 'translateY(0) scale(1)',
        transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
        willChange: 'transform, opacity',
        userSelect: 'none',
      }}
      onClick={() => onAddComponent(id, name, type, image)}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '12px',
          backgroundColor: '#f0f0f0',
          transition: 'transform 0.3s ease',
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
          }}
        />
      </div>

      <h4
        style={{
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#222',
          textAlign: 'center',
          lineHeight: '1.3',
        }}
      >
        {name}
      </h4>
      <p
        style={{
          marginTop: '6px',
          fontSize: '0.85rem',
          color: '#888',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        {type}
      </p>
    </div>
  );
};

export default DraggableComponent;
