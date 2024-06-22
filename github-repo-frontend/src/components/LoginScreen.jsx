import React from 'react';
import axios from 'axios';

const LoginScreen = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:4000/auth/github';
  };

  return (
    <div>
      <h1>Login Screen</h1>
      <button onClick={handleLogin}>Login with GitHub</button>
    </div>
  );
};

export default LoginScreen;
