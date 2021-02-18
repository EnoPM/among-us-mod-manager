import React from 'react';
import { render } from 'react-dom';
import App from './components/App.jsx';
import './assets/styles/main.css';
import './assets/styles/animated-background.css';

let root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

render(<App />, root);