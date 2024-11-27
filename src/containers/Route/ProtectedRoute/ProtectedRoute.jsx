import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';

const ProtectedRoute = ({ Element, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          message.error("Please login to proceed!")
          setIsAuthenticated(false);
          return;
        }        
        console.log('Sending token for verification:', token);


        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}api/verify_token/`,
          {},
          { headers: { Authorization: `Token ${token}` } }
        );
        setIsAuthenticated(response.status === 200);
        message.success("Verified")
      } catch (error) {
        if(error.response.data.error)
        alert(error.response.data.error)
        setIsAuthenticated(false);
      }
    };
    verifyToken();
  }, []); // location.pathname removed solve the duplicate
  // }, [location.pathname]); // Dependency on location.pathname // Continue here check the duplicate called 

  if (isAuthenticated === null) {
    return null; 
  }

  // Block going back to forgot_password if already on other page after requesting reset
  if (location.pathname !== '/forgot_password' && !isAuthenticated) {
    return <Navigate to="/authForm" replace />;
  }

  return isAuthenticated ? <Element {...rest} /> : <Navigate to="/authForm" replace />;
};

export default ProtectedRoute;
