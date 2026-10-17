import React from 'react';
import '../css/loader.css';

const Loader = ({ text = 'Loading...', fullScreen = true }) => {
  return (
    <div
      className={`loader-wrapper ${fullScreen ? 'fullscreen' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="spinner-container" aria-label={text || 'Loading'}>
        <div className="spinner" aria-hidden="true"></div>
        {text && <p className="loader-text">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;
