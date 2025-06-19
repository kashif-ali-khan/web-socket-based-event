import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AgentApp from './AgentApp';
import CustomerApp from './CustomerApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/agent" element={<AgentApp />} />
        <Route path="/customer" element={<CustomerApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);