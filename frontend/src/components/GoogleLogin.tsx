import { get } from 'http';
import React from 'react';
import './GoogleLogin.css';
import image from './google_image.png';

const DEVELOPMENT_AUTH_URL = 'http://localhost:8080/auth/google';
const PRODUCTION_AUTH_URL = 'https://oispahuone.com/api/auth/google';

function login() {
    if (process.env.NODE_ENV === 'development') {
        window.location.href = DEVELOPMENT_AUTH_URL;
    } else {
        window.location.href = PRODUCTION_AUTH_URL;
    }
}

const GoogleLogin = () => {
    return (
        <button className="GoogleButton" onClick={login}>
            <img className="GoogleLogin-logo" src={image} alt=""></img>
        </button>
    );
};

export default GoogleLogin;
