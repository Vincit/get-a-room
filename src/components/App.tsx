import React from 'react';
import logo from './../logo.svg';
import './App.css';
import CitySelection from './CitySelection';

function App() {
    return (
        <div>
            <CitySelection />
            <div></div>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <p>Get A Room Testaan Pipelinen toimivuutta!!</p>
                    <a
                        className="App-link"
                        href="https://reactjs.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn React!
                    </a>
                </header>
            </div>
        </div>
    );
}

export default App;
