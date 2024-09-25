import React from 'react';
import './Loading.css';
import logo from './assets/favicon.png';

function Loading() {
    return (
        <div className="loading-container">
            <img src={logo} alt="Loading..." className="loading-logo" />
        </div>
    );
}

export default Loading;
