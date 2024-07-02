import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { handleError } from '../../../containers/Core/Utils/utils';

function Profile() {
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();
    const [message, setMessages] = useState(null);
    const [messageType, setMessageType] = useState(null);
    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         axios.get('/api/profiles/me/', {
    //             headers: {
    //                 'Authorization': `Token ${token}`  // Add the token to the header
    //             }
    //         }).then(res => {
    //             setProfile(res.data);
    //         }).catch(error => {
    //             // Handle error if token is invalid
    //             console.error('Error fetching profile:', error);
    //         });
    //     }
    // }, []);  

    
    // const setMessage = (messageText, messageType) => {
    //     setMessages(messageText);
    //     setMessageType(messageType);
    // };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            axios.get(`${process.env.REACT_APP_API_URL}profiles/me/`, {
                headers: {
                    'Authorization': `Token ${token}`  // Send the token in the header
                }
            }).then(res => {
                setProfile(res.data);
            }).catch(error => {
                handleError(error, setMessages, setMessageType); 
                console.error('Error fetching profile:', error);
                // ... (error handling) ...
            });
        } else {
            // Handle the case where there is no token in localStorage (user not logged in)
            setProfile(null); 
        }
    }, []);  
    

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}logout/`);
            localStorage.removeItem('authToken'); // Remove token from local storage
            navigate('/authForm');  // Redirect to login after logout
        } catch (error) {
            handleError(error, setMessages, setMessageType); 
        }
    };
    
    
    return (
        <div>
        <h2>My Profile</h2>
        {message && (<div className={`alert alert-${messageType}`}> {message}</div>)}

        {profile ? (
            <div>
            <p>Username: {profile.user.username}</p>
            <p>Email: {profile.user.email}</p>
            {/* Display other profile details */}
            </div>
        ) : (
            <p>Loading profile...</p>
        )}
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
    }

export default Profile;
