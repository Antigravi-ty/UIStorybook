import React from 'react';
import ReactDOM from 'react-dom/client';
import { setCrossClientSyncEnabled } from './showcase/stores/crossClientSync';
import App from './App';
import './index.css';

setCrossClientSyncEnabled(true);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
