// ProtectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ Element, ...rest }) => { // Capitalize 'E' in Element
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyToken = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
            setIsAuthenticated(false);
            return;
            }

            const response = await axios.post(
            `${process.env.REACT_APP_API_URL}verify-token/`, 
            {},
            { headers: { Authorization: `Token ${token}` } }
            );
            setIsAuthenticated(response.status === 200); 
        } catch (error) {
            setIsAuthenticated(false);
        }
        };
        verifyToken(); // Run verification on component mount
    }, []);

    if (isAuthenticated === null) {
        return null; // Show a loading state while verification is in progress
    }

    return isAuthenticated ? (
        <Element {...rest} /> 
    ) : (
        <Navigate to="/authform" replace />
    );
};

export default ProtectedRoute;

