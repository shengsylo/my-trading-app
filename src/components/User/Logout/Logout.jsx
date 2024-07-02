import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
        await axios.post(`${process.env.REACT_APP_API_URL}logout/`);
        localStorage.removeItem('authToken'); // Remove token from local storage
        navigate('/authForm');  // Redirect to login after logout
        } catch (error) {
            console.error('Logout failed:', error);
        // Handle errors here (optional)
        }
    };

    return (
        <button onClick={handleLogout} className="logout-button">Logout</button>
    );
}

export default Logout;
