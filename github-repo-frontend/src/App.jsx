// src/App.jsx
import React, { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, setLoading } from './store';
import LoginScreen from './components/LoginScreen';
import RepoContentScreen from './components/RepoContentScreen';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user.user);
  const loading = useSelector(state => state.user.loading);

  useEffect(() => {
    // Check if user is authenticated
    axios.get('http://localhost:4000/api/user', { withCredentials: true })
      .then(response => {
        dispatch(setUser(response.data));
      })
      .catch(error => {
        console.error('Not authenticated', error);
        dispatch(setLoading(false));
      });
  }, [dispatch]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/repos" /> : <LoginScreen />} />
          <Route path="/repos" element={user ? <RepoContentScreen /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
