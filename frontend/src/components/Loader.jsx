import React from 'react';
import '../css/loader.css';

const Loader = ({ text = 'Loading...', fullScreen = false }) => {
  return (
    <div className={`loader-wrapper ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="spinner-container">
        <div className="spinner" role="status" aria-label="Loading"></div>
        {text && <p className="loader-text">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;