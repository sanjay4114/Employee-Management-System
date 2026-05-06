import React from 'react';

const Card = ({ title, subtitle, children, className = '', bodyClass = '' }) => {
  return (
    <div className={`card glass-card ${className}`}>
      {(title || subtitle) && (
        <div className="card-header glass-card-header">
          {title && <h2 className="h5 card-title mb-0">{title}</h2>}
          {subtitle && <p className="text-secondary small mb-0 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={`card-body ${bodyClass}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
