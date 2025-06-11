import React from 'react';
import { createRoot } from 'react-dom/client';
import './App.css'; // Or the correct path to your CSS file
import App from './App'; // Add this line

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);