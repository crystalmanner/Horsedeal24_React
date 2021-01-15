import React from 'react';

const ShareIcon = ({ children }) => (
    <svg
        viewBox="0 0 32 32" 
        role="presentation" 
        aria-hidden="true" 
        focusable="false"
        style={{
            height: '18px', 
            width: '18px', 
            display: 'block', 
            fill: 'rgb(72, 72, 72)'
        }} 
    >
        {children}
    </svg>
  );


export default ShareIcon;