import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AgentApp from './AgentApp';
import CustomerApp from './CustomerApp';
import { ACSProvider } from './ACSProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/agent" element={<ACSProvider displayName="Agent"><AgentApp /></ACSProvider>} />
        <Route path="/customer" element={<ACSProvider displayName="Customer"><CustomerApp /></ACSProvider>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);