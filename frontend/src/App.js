import logo from './logo.svg';
import './App.css';

import React from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
    <div className="half user-side">
      <h2>Are you a User?</h2>
      <button onClick={() => navigate('/user')}>Click Here</button>
    </div>
    <div className="half driver-side">
      <h2>Are you a Vehicle Driver?</h2>
      <button onClick={() => navigate('/driver')}>Click Here</button>
    </div>
    </div>
  );
}

export default App;
