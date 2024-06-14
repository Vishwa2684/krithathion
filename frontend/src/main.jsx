
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Pages/Home.jsx';
import History from './Pages/History.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import Signup from './Pages/SignUp/Signup.jsx';
import NotFound from './Pages/NotFound.jsx';
import Login from './Pages/LogIn/Login.jsx';
import { auth } from './config/config.js';
import { onAuthStateChanged } from 'firebase/auth';

function Root() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  if (loading) return null; 

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        {/* <Route path='ar' element={<ARScene/>}></Route> */}
        {/* Protect the '/c' route */}
        {user ? <Route path='/c' element={<App />} /> : <Route path='/c' element={<Navigate to="/login" />} />}
        {user ? <Route path='/c/history' element={<History />} /> : <Route path='/c' element={<Navigate to="/login" />} />}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
