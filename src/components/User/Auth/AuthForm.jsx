import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import './AuthForm.css';
import { handleError, MessageTypeEnum } from '../../../containers/Core/Utils/utils';


function AuthForm() {
    const [view, setView] = useState('login'); // 'login' or 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [message, setMessages] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [errors, setErrors] = useState({});
    
    const navigate = useNavigate();
    
    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            numeric: /[0-9]/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        const valid = Object.values(requirements).every(Boolean);
        return { valid, requirements };
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            navigate('/profile');
        }
    }, [ navigate]);

    const setMessage = (messageText, messageType) => {
        setMessages(messageText);
        setMessageType(messageType);
    };

    const switchView = (newView) => {
        setView(newView);
        setMessage("","")
        setShowPasswordField(false); // Reset password field visibility
        // setEmail(''); // Reset email field
        setPassword('');
    };

    const handleContinue = async (event) => {
        event.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
        setMessage('Invalid email address.',MessageTypeEnum.DANGER); 
        return; 
        }

        try {
            let x ='';
            if(view === 'register')
                x = `verify-email-register`;
            else 
                x = `verify-email`;
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}${x}/`, // Call verification endpoint
                { email }
            );
            setShowPasswordField(true);
            setMessage(response.data.message,MessageTypeEnum.SUCCESS);
        } catch (error) {
            handleError(error, setMessages, setMessageType); 
        }
    };


    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("View :",view)
        if( view === 'register') {
            const { valid, requirements } = validatePassword(password);
            console.log("Password :",password)

            if (!valid) {
                setErrors({
                    password: "Password must be at least 8 characters long, include uppercase, lowercase, numeric, and special characters."
                });
                return;
            }
            if (password !== confirmPassword) {
                setErrors({
                    confirmPassword: "Passwords do not match."
                });
                return;
            }
            setErrors("")
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}users/`, {
                    username,
                    password,
                    email,
                });
                localStorage.setItem('authToken', response.data.token);
                console.log('Registration successful:', response.data);
                setMessage('Registration successful. Redirecting to profile...',MessageTypeEnum.SUCCESS);
                setTimeout(() => navigate('/profile'), 2000); // Redirect after 2 seconds
            } catch (error) {
                handleError(error, setMessages, setMessageType); 
            }
        }else{
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}login/`, {
                    email,
                    password,
                });
                localStorage.setItem('authToken', response.data.token);
                setMessage('Login successful. Redirecting to profile...',MessageTypeEnum.SUCCESS);
                setTimeout(() => {
                    navigate('/profile');
                }, 2000);
            } catch (error) {
                handleError(error, setMessages, setMessageType); 
            }
        }
    };

    const handleEmailChange = async (event) => {
        if(showPasswordField){
            setShowPasswordField(false);
            setMessages("",""); 
        }
        setEmail(event.target.value)
    };

    return (
        <Container className="login-container d-flex align-items-center justify-content-center">
        <Card className="login-card p-4 shadow-sm">
            <Card.Body>
            <div className="text-center mb-4">
                <img src="/logo.png" alt="Logo Icon" className="mb-5 w-25 rounded-circle" />
                <h2 className="text-center mb-4">
                    {view === 'login' ? 'Welcome Back' : 'Create Your Account'}
                </h2>
                {/* <p className="text-muted">Use your Account</p> */}
            </div>
            {message && (<div className={`alert alert-${messageType}`}> {message}</div>)}
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email" className="mb-3">
                    <Form.Label className="text-muted">Email address *</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e)}
                        placeholder="Enter email address"
                        required
                        className="form-input"
                    />
                    {/* <Form.Control.Feedback type="invalid">
                        {errors.email}
                    </Form.Control.Feedback> */}

                </Form.Group>
                
                {showPasswordField && ( 
                    <>
                        <Form.Group controlId="password" className="mb-3">
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                required
                                isInvalid={!!errors.password}
                                className="form-input"
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>    
                        </Form.Group>
                        {view === 'register' && (
                            <Form.Group controlId="confirmPassword" className="mb-3">
                                <Form.Label>Re-enter Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    isInvalid={!!errors.confirmPassword}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.confirmPassword}
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}

                        {view === 'register' && (
                            <Form.Group controlId="username" className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    isInvalid={!!errors.username}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.username}
                                </Form.Control.Feedback>
                            </Form.Group>
                        )}


                        <div className="text-center">
                            <a href="#" className="text-primary small">
                                Forgot password?
                            </a>
                        </div>
                    </>
                )}

                {!showPasswordField ? (
                    <Button variant="primary" type="submit" onClick={handleContinue} className="w-100">
                        Continue
                    </Button>
                ) : (
                    <Button variant="primary" type="submit" className="w-100">
                        {view === 'login' ? 'Log In' : 'Register'}
                    </Button>
                )}
                <div className="mt-3 text-center">
                    {view === 'login' ? (
                        <span>
                            Don't have an account?{' '}
                            <Button variant="link" onClick={() => switchView('register')}>
                                Sign up
                            </Button>
                        </span>
                    ) : (
                        <span>
                            Already have an account?{' '}
                            <Button variant="link" onClick={() => switchView('login')}>
                                Log in
                            </Button>
                        </span>
                    )}
                </div>

            </Form>
            <div className="mt-3 text-center small text-muted">
                Not your computer? Use Guest mode to sign in privately.
                <br />
                <a href="#" className="text-primary">
                Learn more
                </a>
            </div>
            <hr />
            <div className="text-center">
                <Button variant="outline-primary" className="w-100 mb-2">
                <img src="/logo.png" alt="Logo Icon" className="icon" /> Sign in with Google
                </Button>
            </div>
            </Card.Body>
        </Card>
        </Container>
    );
}

export default AuthForm;
